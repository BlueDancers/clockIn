<template>
  <view class="user_data">
    <view class="YZetDYvq">
      <image class="mtQZQJqu" :src="userInfo.avatarUrl || require('../../images/user.png')" />
      <view class="tWmOlrLg" @click="getUserProfile">{{ userInfo.nickName || '点击登录' }}</view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import Taro from '@tarojs/taro'
export default defineComponent({
  setup() {
    const db = Taro.cloud.database()

    const userInfo = ref({
      avatarUrl: '',
      nickName: '',
    })

    userInfo.value = Taro.getStorageSync('userInfo')

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
    function registory(data) {
      console.log('添加用户', data)
      db.collection('user')
        .add({
          data: {
            data,
          },
        })
        .then(() => {
          loginSucc(data)
        })
    }
    function loginSucc(data) {
      Taro.setStorageSync('login', true)
      Taro.setStorageSync('userInfo', data)
      userInfo.value = Taro.getStorageSync('userInfo')
      Taro.showToast({
        title: '登录成功~',
        icon: 'success',
      })
    }
    return {
      getUserProfile,
      userInfo,
    }
  },
})
</script>

<style lang="scss">
.user_data {
  .YZetDYvq {
    background-color: #ffffff;
    border-color: #000000;
    border-radius: 0rpx;
    border-style: solid;
    border-width: 0rpx;
    box-sizing: border-box;
    height: 234rpx;
    left: 0rpx;
    margin-bottom: 20rpx;
    margin-left: 20rpx;
    margin-right: 20rpx;
    margin-top: 20rpx;
    padding-bottom: 0rpx;
    padding-left: 0rpx;
    padding-right: 0rpx;
    padding-top: 0rpx;
    position: relative;
    top: 0rpx;
    width: 710rpx;
    z-index: 100;
    box-shadow: 5rpx 5rpx 10rpx #eee;
  }
  .YZetDYvq .mtQZQJqu {
    background-color: #ffffff00;
    border-color: #000000;
    border-radius: 200rpx;
    border-style: solid;
    border-width: 0rpx;
    box-sizing: border-box;
    height: 128rpx;
    left: 54rpx;
    margin-bottom: 0rpx;
    margin-left: 0rpx;
    margin-right: 0rpx;
    margin-top: 0rpx;
    padding-bottom: 0rpx;
    padding-left: 0rpx;
    padding-right: 0rpx;
    padding-top: 0rpx;
    position: absolute;
    top: 48rpx;
    width: 128rpx;
    z-index: 11;
  }
  .YZetDYvq .tWmOlrLg {
    background-color: #ffffff;
    border-color: #000000;
    border-radius: 0rpx;
    border-style: solid;
    border-width: 0rpx;
    box-sizing: border-box;
    color: #000000;
    font-size: 28rpx;
    font-weight: normal;
    height: 42rpx;
    left: 194rpx;
    margin-bottom: 0rpx;
    margin-left: 0rpx;
    margin-right: 0rpx;
    margin-top: 0rpx;
    padding-bottom: 0rpx;
    padding-left: 0rpx;
    padding-right: 0rpx;
    padding-top: 0rpx;
    position: absolute;
    text-align: center;
    top: 96rpx;
    width: 174rpx;
    z-index: 12;
  }
}
</style>
