
let hasRoute = false;
let listenId = 0;
const deepClone = (obj) => {  //可传入对象 或 数组
    //  判断是否为 null 或 undefined 直接返回该值即可,
    if (obj === null || !obj) return obj;
    // 判断 是要深拷贝 对象 还是 数组
    if (Object.prototype.toString.call(obj) === "[object Object]") { //对象字符串化的值会为 "[object Object]"
        let target = {}; //生成新的一个对象
        const keys = Object.keys(obj); //取出对象所有的key属性 返回数组 keys = [ ]
        //遍历复制值, 可用 for 循环代替性能较好
        keys.forEach(key => {
            if (obj[key] && typeof obj[key] === "object")
                //如果遇到的值又是 引用类型的 [ ] {} ,得继续深拷贝
                target[key] = deepClone(obj[key]);//递归
            else
                target[key] = obj[key];

        })
        return target  //返回新的对象
    } else if (Array.isArray(obj)) {
        // 数组同理
        let arr = [];
        obj.forEach((item, index) => {
            if (item && typeof item === "object")
                arr[index] = deepClone(item);
            else
                arr[index] = item;
        })
        return arr
    }
}
const isObj = (val) => (val && Object.prototype.toString.call(val)) === "[object Object]";
const isArr = (likeArray) => Array.isArray(likeArray);
const isFunc = (func) => func instanceof Function;

export class createStore {
    routeType = { "redirectTo": true, "navigateTo": true, "appLaunch": true, "switchTab": true };
    state = {};
    mutations = {};
    events = {};
    oldStore = {};
    static dev = true;
    static global = true;

    constructor(userConfig = {}) {
        const { state, mutations, global = false, dev = true } = userConfig;
        if (!isObj(state)) throw new SyntaxError("创建仓库时,state必须为object");
        if (!isObj(mutations)) throw new SyntaxError("创建仓库时,mutations必须为object");
        this.state = { ...state };
        this.oldStore = deepClone(state);
        this.mutations = { ...mutations };
        createStore.global = global;
        createStore.dev = dev;
        // 防止多次注册函数
        if (!hasRoute) {
            wx.onAppRoute(({ openType, webviewId }) => { this.routeType[openType] && this.updateData() });
            hasRoute = true;
        }

    }

    $commit = (event, val) => {
        if (!val && createStore.dev) console.log(`%c 🍇 事件${event}commit内容为空: `, 'font-size:20px;background-color: #7F2B82;color:#fff;', val);;
        if (!event && createStore.dev) return console.error(`commit:${event} 不能为空`);
        if (!this.mutations[event] && createStore.dev) return console.log(`%c 🍓 找不到 ${event} commit方法: 在store中未找到匹配`, 'font-size:20px;background-color: #FFDD4D;color:#fff;', event);
        if (!isFunc(this.mutations[event]) && createStore.dev) return console.log(`%c 🍇 事件${event} 不是函数: 请在store中检查`, 'font-size:20px;background-color: #7F2B82;color:#fff;',);;
        // 如果传进来是个对象,就要按小程序的模式进行 更新数据
        if (isObj(event)) {
            // 同步库
            Object.keys(event).forEach((key,idx)=>{
                this.state[key] = event[key];
            })
        } else {
            // 保存旧的store
            this.oldStore = deepClone(this.state);
            // 调用对应的mutation   
            this.mutations[event](this.state, val);
        }
        this.updateData('commit');

    }

    // 更新数据
    updateData = () => {
        // 这里有待优化, 要对页面声明依赖的数据进行对比,如果发生变化就需要进行更新数据
        getCurrentPages().forEach(pageContext => {
            let stateMap = {};
            if (createStore.global) {
                if (isArr(pageContext.useStore)) {
                    pageContext.useStore.forEach(key => stateMap[key] = this.state[key]);
                } else if (pageContext.useStore !== false) { // 如果设置了useStore=false 则没必要渲染
                    stateMap = { ...this.state }
                }
            } else {
                if (isArr(pageContext.useStore)) {
                    pageContext.useStore.forEach(key => stateMap[key] = this.state[key]);
                } else if (!!pageContext.useStore === true) {
                    stateMap = { ...this.state }
                } else {
                    createStore.dev && Object.keys(stateMap).length <= 0 && console.error(`当前页:${pageContext.route} 未设置useStore(未设置global为true,需配置useStore)`)
                }
            }
            Object.keys(stateMap).length > 0 && pageContext.setData({$store:stateMap});

        });
    }

    $listen = (eventName, callback) => {
        if (!eventName) throw new TypeError("$listen 第一个参数:事件名为空");
        if (!callback) throw new TypeError("listen 第二个参数:回调函数为空");
        let currentPage = getCurrentPages().slice(-1)[0];
        if (!isFunc(callback)) return console.error('$listen 第二个参数必须是 函数');
        if (!this.events[eventName]) this.events[eventName] = [];
        // 这里防止$listen放在onShow里,被多次触发,会放个重复的callback
        if (this.events[eventName].find((cb) => cb.eventName == eventName && cb.ctx === currentPage)) return;
        callback.listenId = listenId += 1;
        callback.ctx = currentPage;
        callback.eventName = eventName;
        this.events[eventName].push(callback);
        return listenId;
    }
    $emit = (eventName, params) => {
        if (!eventName) return console.error('$emit 请传入正确事件值')
        let targetFunc = this.events[eventName] || [];
        let currentPages = getCurrentPages().slice(-1)[0];
        for (let index = 0; index < targetFunc.length; index++) {
            const cb = targetFunc[index];
            if (cb === null) {
                targetFunc.splice(index, 1);
                index--;
                continue
            }
            isFunc(cb) && cb(params, currentPages)
        }
    }
    $offListen = (eventName, callbackId) => {
        if (!eventName) throw new TypeError("$offListen 第一个参数:事件名为空");

        let targetFunc = this.events[eventName] || [];
        if (targetFunc.length <= 0) return;
        isArr(targetFunc) && targetFunc.forEach((cb, idx) => {
            if (!callbackId) {
                this.events[eventName][idx] = null;
            } else
                if (cb.listenId == callbackId) {
                    this.events[eventName][idx] = null;
                }
        })
    }
}
