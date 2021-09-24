import { ref } from 'vue'
import Taro from '@tarojs/taro'

export default function barHeight() {
  const barHeight = ref(0) // 状态栏高度
  // 获取高度
  Taro.getSystemInfo({}).then((res) => {
    barHeight.value = res.statusBarHeight
  })
  return {
    barHeight,
  }
}
