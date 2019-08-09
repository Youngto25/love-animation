Page({
  data: {
    y: [],
    imageHeight: null,
    index: 1,
    zhanshi: '',
    show: false,
    changeDownload: false,
    changeCancel: false
  },

  onLoad: function (options) {
    this.loadImage()
    this.setData({
      imageHeight: wx.getSystemInfoSync().windowHeight
    })
  },

  x() {
    wx.request({
      url: 'https://img.xjh.me/random_img.php?type=bg&ctype=acg',
      success: res => {
        let index = this.data.y.length
        this.data.y[index] = res.data.match(/".*?"/g)[0].replace("\"", "").replace("\"", "")
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
    }, 0)
  },

  onPageScroll: function (e) {
    if (e.scrollTop > this.data.imageHeight * this.data.index - 100) {
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
      show: false,
      changeDownload: true
    })
    setTimeout(()=>{
      this.setData({
        changeDownload: false
      },200)
    })
    wx.downloadFile({
      url: `https:${this.data.zhanshi}`,     //仅为示例，并非真实的资源
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
      changeCancel: true
    })
    setTimeout(()=>{
      this.setData({changeCancel: false})
    },1000)
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