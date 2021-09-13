<template>
  <view class="user_data">
    <view class="user_data_box" @click="getUserProfile">
      <image class="user_image" :src="userInfo.avatarUrl || '../../images/user.png'" mode="" />
      <text class="user_name">{{ userInfo.nickName || '点击登录' }}</text>
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

    userInfo.value = Taro.getStorageSync('userinfo')

    function getUserProfile() {
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

    function getUserInfo(data) {
      db.collection('user')
        .where({
          openid: data.openid,
        })
        .get()
        .then((res) => {
          // openid 无用了
          delete data.openid

          if (res.data.length) {
            Taro.setStorageSync('userinfo', res.data)
            userInfo.value = Taro.getStorageSync('userinfo')
            Taro.showToast({
              title: '登录成功~',
              icon: 'success',
            })
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
          Taro.setStorageSync('userinfo', data)
          userInfo.value = Taro.getStorageSync('userinfo')
          Taro.showToast({
            title: '登录成功~',
            icon: 'success',
          })
        })
    }
    return {
      getUserProfile,
      userInfo,
    }
  },
})
</script>
