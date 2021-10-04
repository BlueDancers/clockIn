import { ref, Ref } from 'vue'
import Taro from '@tarojs/taro'
import TimeData from './TimeData'

function userData() {
  const islogin = ref(false)
  const userInfo = ref({
    avatarUrl: '',
    nickName: '',
    _openid: '',
  })
  const db = Taro.cloud.database()

  userInfo.value = Taro.getStorageSync('userInfo')
  islogin.value = Taro.getStorageSync('login')
  // 按钮触发登录
  function getUserProfile() {
    if (!Taro.getStorageSync('login')) {
      Taro.getUserProfile({
        desc: '登录使用', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (info) => {
          Taro.cloud.callFunction({
            name: 'login',
            data: {},
            success: (res: any) => {
              console.log(info)
              getUserInfo({ ...info.userInfo, openid: res.result.openid })
            },
            fail: (err) => {
              console.error('[云函数] [login] 调用失败', err)
            },
          })
        },
      })
    }
  }
  // 获取微信信息(判断是否新用户)
  function getUserInfo(data) {
    db.collection('user')
      .where({
        _openid: data.openid,
      })
      .get()
      .then((res) => {
        console.log(res.data)
        if (res.data.length) {
          loginSucc({ ...res.data[0].data, _openid: res.data[0]._openid })
        } else {
          registory(data)
        }
      })
  }
  // 创建用户
  function registory(data) {
    console.log('添加用户', data)
    db.collection('user')
      .add({
        data: {
          ...data,
          alltime: 0,
        },
      })
      .then(() => {
        loginSucc(data)
      })
  }
  // 登录成功的回调函数
  function loginSucc(data) {
    Taro.setStorageSync('login', true)
    Taro.setStorageSync('userInfo', data)
    userInfo.value = Taro.getStorageSync('userInfo')
    islogin.value = Taro.getStorageSync('login')
    Taro.showToast({
      title: '登录成功~',
      icon: 'success',
    })
  }
  // 退出登录
  function unLogin() {
    Taro.removeStorageSync('login')
    Taro.removeStorageSync('userInfo')
    userInfo.value.avatarUrl = ''
    userInfo.value.nickName = ''
    islogin.value = false
  }
  return {
    getUserProfile,
    unLogin,
    userInfo,
    islogin,
  }
}

export default userData()
