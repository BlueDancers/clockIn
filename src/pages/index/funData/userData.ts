import { ref, Ref } from 'vue'
import Taro from '@tarojs/taro'
import TimeData from './TimeData'

function userData() {
  const islogin = ref(false)
  // 用户基本数据
  const userInfo = ref({
    avatarUrl: '',
    nickName: '',
    _openid: '',
  })
  // 目标事件与目标时间
  const target = ref({
    targetTitle: '',
    targetTime: '',
  })
  const db = Taro.cloud.database()
  userInfo.value = Taro.getStorageSync('userInfo')
  islogin.value = Taro.getStorageSync('login')
  // 获取目标相关信息
  function getTargetFun() {
    // 首次获取
    if (Taro.getStorageSync('login')) {
      db.collection('user')
        .where({
          _openid: Taro.getStorageSync('userInfo')._openid,
        })
        .get()
        .then((res) => {
          target.value.targetTitle = res.data[0].targetTitle
          target.value.targetTime = res.data[0].targetTime
        })
    }
  }
  // 按钮触发登录
  function getUserProfile() {
    if (!Taro.getStorageSync('login')) {
      Taro.getUserProfile({
        desc: '登录使用',
        success: (info) => {
          Taro.cloud.callFunction({
            name: 'login',
            data: {},
            success: (res: any) => {
              console.log(info)
              getUserInfo({ ...info.userInfo, openid: res.result.openid })
              getTargetFun()
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
        console.log('获取微信信息', res.data)
        if (res.data.length) {
          loginSucc({ ...res.data[0], _openid: res.data[0]._openid })
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
    getTargetFun,
    unLogin,
    userInfo,
    islogin,
    target,
  }
}

export default userData()
