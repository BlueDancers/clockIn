import { parseTime, formatTimeArray } from '../../../utils/index'
import { ref } from 'vue'

export default function indexTime() {
  const carrentTime = ref('00:00:00') // 当前时间
  const onLineTime = ref('00:00:00') // 进行时间
  let carrentIntVal // 当前时间定时器
  let onLineIntVal // 当前时间定时器
  function startCarrent() {
    carrentTime.value = parseTime(Date.now(), '{h}:{i}:{s}')
    carrentIntVal = setInterval(() => {
      carrentTime.value = parseTime(Date.now(), '{h}:{i}:{s}')
    }, 1000)
  }
  function startOnLine(data) {
    let online = Date.now() - new Date(data.startTime).getTime()
    onLineTime.value = formatTimeArray(online).join(':')
    onLineIntVal = setInterval(() => {
      let online = Date.now() - new Date(data.startTime).getTime()
      onLineTime.value = formatTimeArray(online).join(':')
    }, 1000)
  }
  function clearCarrent() {
    clearInterval(carrentIntVal)
  }
  function clearonLine() {
    clearInterval(onLineIntVal)
  }

  return {
    carrentTime,
    onLineTime,
    startCarrent,
    startOnLine,
    clearCarrent,
    clearonLine,
  }
}
