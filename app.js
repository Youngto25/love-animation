//app.js
import Store from './utils/store'

let store = new Store({
  state: {
    msg: '这是一个全局状态',
    user: {
      name: "李四"
    }
  }
})

// console.log(store.getState().msg); //这是一个全局状态 1.2.6+

App({
  store,
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    //获取机型数据
    const { statusBarHeight, platform } = wx.getSystemInfoSync()
    console.log('pla',platform)
    const { top, height, width } = wx.getMenuButtonBoundingClientRect()
    console.log('top',top,height,width)
    // 状态栏高度
    wx.setStorageSync('statusBarHeight', statusBarHeight)
    this.globalData.statusBarHeight = statusBarHeight
    // 胶囊按钮高度 一般是32 如果获取不到就使用32
    wx.setStorageSync('menuButtonHeight', height ? height : 32)
    
    // 判断胶囊按钮信息是否成功获取
    if (top && top !== 0 && height && height !== 0) {
        const navigationBarHeight = (top - statusBarHeight) * 2 + height
        console.log('navigationBarHeight',navigationBarHeight)
        // 导航栏高度
        this.globalData.navigatorBarHeight = navigationBarHeight
    } else {
        this.globalData.navigatorBarHeight = platform === 'android' ? 48 : 40
    }

    // 登录
    wx.login({
      success: res => {
        console.log('res',res)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      },
      fail: err=> {
        console.log('err',res)
      }
    })
  },
  globalData: {
    userInfo: null,
    statusBarHeight: 0,
    navigatorBarHeight: 0
  }
})