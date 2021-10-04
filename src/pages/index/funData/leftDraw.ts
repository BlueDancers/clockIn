import { ref } from 'vue'
import Taro from '@tarojs/taro'

export default function leftDraw() {
  const leftDrawShow = ref(false) // 侧边栏
  function openLeft() {
    Taro.showLoading()
    leftDrawShow.value = true
    setTimeout(() => {
      Taro.hideLoading()
    }, 100)
  }
  function closeLeft() {
    leftDrawShow.value = false
  }
  return {
    leftDrawShow,
    openLeft,
    closeLeft,
  }
}
