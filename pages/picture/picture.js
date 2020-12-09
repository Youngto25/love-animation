Page({
  data: {
    y: [],
    imageHeight: null,
    index: 1,
    zhanshi: '',
    show: false
  },

  showImage(e){
    console.log('e',e.currentTarget.dataset.img)
    wx.previewImage({
      current: e.currentTarget.dataset.img, // 当前显示图片的http链接
      urls: this.data.y // 需要预览的图片http链接列表
    })
  },

  onLoad: function (options) {
    this.loadImage()
    this.setData({
      imageHeight: wx.getSystemInfoSync().windowHeight
    })
  },

  x() {
    wx.request({
      url: 'https://bing.ioliu.cn/v1/rand?type=json&w=400&h=240',
      success: res => {
        let index = this.data.y.length
        let url = res.data.data.url.replace(/^(http)[s]*(\:\/\/)/, 'https://images.weserv.nl/?url=')
        this.data.y[index] = url
        this.setData({ y: this.data.y })
      }
    })
  },

  loadImage() {
    let n = 0
    let timer = setInterval(() => {
      n++
      if (n > 9) {
        clearInterval(timer)
      }
      this.x()
    }, 10)
  },

  onPageScroll: function (e) {
    if(this.data.index === 1){
      this.data.index += 1
      this.loadImage()
    } else if (e.scrollTop > this.data.imageHeight * this.data.index * 1.8 - 200) {
      this.data.index += 1
      this.loadImage()
    }
    this.downloadCancel()
  },

  download(e) {
    let src = e.target.dataset.src
    this.isDownload(src)
  },

  isDownload(src) {
    this.setData({ zhanshi: src })
    this.setData({ show: true })
  },

  downloadImage() {
    this.setData({ 
      show: false
    })
    setTimeout(()=>{
      this.setData({
      },200)
    })
    wx.downloadFile({
      url: `${this.data.zhanshi}`,     //仅为示例，并非真实的资源
      success: function (res) {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              wx.showToast({
                title: '保存图片成功！',
              })
            },
            fail(res) {
              wx.showToast({
                title: '保存图片失败！',
              })
            }
          })
        }
      }
    })
  },

  downloadCancel() {
    this.setData({
      show: false,
    })
  },

  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})