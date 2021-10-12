import { createApp } from 'vue'
import { Button, Toast } from '@nutui/nutui-taro'
import '@nutui/nutui-taro/dist/style.css'

import './app.scss'
import Taro from '@tarojs/taro'

let showStatus = false
const App = createApp({
  onLoad() {
    // 初始化是否打开了上传图片
    Taro.setStorageSync('upImgShow', false)
  },
  onShow() {
    if (!showStatus) {
      Taro.cloud.init({
        env: 'clockin-0g8pzcuv95c47ea6',
        traceUser: true,
      })
      // 字体文件
      Taro.cloud
        .getTempFileURL({
          fileList: [
            'cloud://clockin-0g8pzcuv95c47ea6.636c-clockin-0g8pzcuv95c47ea6-1307430541/this/Timeburner-xJB8.ttf',
          ],
        })
        .then((res) => {
          return Taro.loadFontFace({
            family: 'myfont',
            source: `url(${res.fileList[0].tempFileURL})`,
            success: (res) => {
              console.log(res)
            },
          })
        })
        .catch((error) => {
          console.log(error)
        })
    }
  },
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})

// App.use(Button).use(Toast)

export default App
