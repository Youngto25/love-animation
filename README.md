# love-animation
一款可以观看自然主题图片的微信小程序。如果喜欢，支持在线下载。拥有两个页面，picture page（浏览图片）及introduce page（关于这个小程序的介绍）。当每个图片下面的 download 按钮被点击时，弹出是否确定下载的弹窗。不论是否下载成功，都会弹出消息进行提醒。

## 效果图
![home](https://github.com/Youngto25/love-animation/blob/master/images/picture_page.png)

![picture](https://github.com/Youngto25/love-animation/blob/master/images/introduce_page.png)

![download](https://github.com/Youngto25/love-animation/blob/master/images/download.png)

## 关键代码
获取图片信息
```
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
}
```
下载图片
```
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
 ```
