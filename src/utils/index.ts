/**
 * 时间格式化
 * @param {any} time
 * @param {string} cFormat
 */
export function parseTime(time, cFormat?) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

/**
 * 把一个时间戳转换为时分秒天数组
 * @param duration 计时时长
 */
export function formatTimeArray(duration) {
  if (duration <= 0) {
    return ['00', '00', '00', '00']
  }

  // 计算天数
  let days = Math.floor(duration / (1000 * 60 * 60 * 24)) + ''

  // 计算时分秒
  let hours = Math.floor((duration % (1000 * 60 * 60 * 24 * 24)) / (1000 * 60 * 60)) + ''

  let minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60)) + ''

  let seconds = Math.floor((duration % (1000 * 60)) / 1000) + ''

  return [hours.padStart(2, '0'), minutes.padStart(2, '0'), seconds.padStart(2, '0')]
}
