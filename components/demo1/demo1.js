// components/demo1/demo1.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    message: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickWrapper: function(e){
      console.log('wrapper 被点击了',e.currentTarget)
      var myEventDetail = {name: 'yangtao'} // detail对象，提供给事件监听函数
      var myEventOption = {time: new Date()} // 触发事件的选项
      this.triggerEvent('myevent', myEventDetail, myEventOption)
    }
  }
})
