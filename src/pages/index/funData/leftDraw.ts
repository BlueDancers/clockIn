import { ref } from 'vue'
import Taro from '@tarojs/taro'

export default function leftDraw() {
  const leftDrawShow = ref(false) // 侧边栏
  function openLeft() {
    leftDrawShow.value = true
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
