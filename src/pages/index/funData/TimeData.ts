import { formatTimeArray, parseTime } from '../../../utils/index'
import { ref, Ref } from 'vue'
import Taro from '@tarojs/taro'

/**
 * 当前用户学习数据信息
 * @returns
 */
function TimeData() {
  const db = Taro.cloud.database()
  const carrentMonth: Ref<any> = ref([]) // 当月天数
  const carrentEvent = ref({}) // 当月时间表
  const carrentDay = ref(0) // 当月学习天数
  const carrentTime: Ref<any> = ref('') // 当月学习时间

  // 初始化
  var date = new Date()
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var d = new Date(year, month, 0).getDate()
  carrentMonth.value = Array(d).fill(0)
  /**
   * 获取学习数据
   */
  function getEventInfo() {
    let y = parseTime(Date.now(), '{y}')
    let m = parseTime(Date.now(), '{m}')
    db.collection('eventTime')
      .where({
        _openid: Taro.getStorageSync('userInfo')._openid,
      })
      .get()
      .then((res) => {
        if (res.data.length == 0) {
          return false
        }
        try {
          let data = res.data[0]
          carrentEvent.value = data.timeObj[y][m]
          // 当月学习天数
          carrentDay.value = Object.keys(carrentEvent.value).length
          // 当月学习时间
          let allTime = formatTimeArray(
            Object.keys(carrentEvent.value).reduce((item, data) => {
              return item + carrentEvent.value[data]
            }, 0)
          ).map((e) => Number(e))
          carrentTime.value = allTime.splice(0, 2).join('.')
          console.log(carrentEvent.value)

          // 填入存在数据的天数
          carrentMonth.value = carrentMonth.value.map((res, index) => {
            let carrent = index + 1
            if (carrent < 10) {
              carrent = '0' + String(carrent)
            } else {
              carrent = String(carrent)
            }
            if (Object.keys(carrentEvent.value).includes(carrent)) {
              res = carrentEvent.value[carrent]
            }
            return res
          })
          console.log('正式数据', carrentMonth.value)
        } catch (error) {
          console.log(error)
        }
      })
  }
  return {
    carrentMonth,
    carrentEvent,
    carrentDay,
    carrentTime,
    getEventInfo,
  }
}

export default TimeData()
