<template>
  <view class="left_draw" v-show="props.leftDrawShow">
    <view class="left_draw_back" @click="close"></view>
    <view class="left_draw_center">
      <!-- 用户信息 -->
      <view class="user_info">
        <image class="info_img" :src="userInfo.avatarUrl || require('../../../images/user.png')"></image>
        <view class="info_data" v-if="islogin">
          <view class="info_user">{{ userInfo.nickName }}</view>
          <view class="unfo_label">学渣</view>
        </view>
        <view v-else class="info_unlogin" @click="getUserProfile">
          点击登录
        </view>
      </view>
      <!-- 距离目标 -->
      <view class="time_text">
        距离考研还差
        <text class="time_number">240</text>
        天
      </view>
      <!-- 打卡周期 -->
      <view class="time_tabel_com">
        <view class="table_text" v-if="carrentDay != 0">本月学习{{ carrentDay }}天,累计{{ carrentTime }}小时</view>
        <view class="table_text" v-if="carrentDay == 0">本月您还没开始学习哦</view>
        <view class="table_con">
          <view class="table_con_list">
            <view class="table_item" :class="item > 0 ? 'data_item' : ''" v-for="item in carrentMonth" :key="item">
            </view>
          </view>
        </view>
      </view>
      <!-- 菜单 -->
      <view class="menu_list">
        <view class="list_item">
          <image class="item_icon" src="../../../images/menu1.png"></image>
          <view class="item_text">输入目标</view>
          <image class="item_next" src="../../../images/right.png"></image>
        </view>
        <view class="list_item">
          <image class="item_icon" src="../../../images/menu2.png"></image>
          <view class="item_text">意见反馈</view>
          <image class="item_next" src="../../../images/right.png"></image>
        </view>
        <view class="list_item">
          <image class="item_icon" src="../../../images/menu3.png"></image>
          <view class="item_text">设置</view>
          <image class="item_next" src="../../../images/right.png"></image>
        </view>
      </view>
      <!-- 退出登录 -->
      <button v-if="islogin" class="un_login" @click="unLogin">退出登录</button>
    </view>
  </view>
</template>

<script lang="ts">
import Taro from '@tarojs/taro'
import { formatTimeArray, parseTime } from '../../../utils'
import { defineComponent, onMounted, Ref, ref, watch } from 'vue'
export default defineComponent({
  props: ['leftDrawShow'],
  setup(props, { emit }) {
    const db = Taro.cloud.database()
    const islogin = ref(false)
    const userInfo = ref({
      avatarUrl: '',
      nickName: '',
      _openid: '',
    })
    const carrentEvent = ref({}) // 当月时间表
    const carrentDay = ref(0) // 当月学习天数
    const carrentTime: Ref<any> = ref([]) // 当月学习时间
    const carrentMonth: Ref<any> = ref([]) // 当月天数
    onMounted(() => {
      userInfo.value = Taro.getStorageSync('userInfo')
      islogin.value = Taro.getStorageSync('login')

      var date = new Date()
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var d = new Date(year, month, 0).getDate()
      carrentMonth.value = Array(d).fill(0)
    })
    watch(
      () => props.leftDrawShow,
      (value) => {
        if (value) {
          getEventInfo()
        }
      }
    )
    function close() {
      emit('closeLeft')
    }
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
    /**
     * 获取学习数据
     */
    function getEventInfo() {
      let y = parseTime(Date.now(), '{y}')
      let m = parseTime(Date.now(), '{m}')
      db.collection('eventTime')
        .where({
          _openid: userInfo.value._openid,
        })
        .get()
        .then((res) => {
          if (res.data.length == 0) {
            return false
          }
          let data = res.data[0]
          // 获取本月学习多少天
          carrentEvent.value = data.timeObj[y][m]

          // 积累多少小时
          carrentDay.value = Object.keys(carrentEvent.value).length
          let allTime = formatTimeArray(
            Object.keys(carrentEvent.value).reduce((item, data) => {
              return item + carrentEvent.value[data]
            }, 0)
          ).map((e) => Number(e))
          carrentTime.value = allTime.splice(0, 2).join('.')

          // 填入存在数据的天数
          carrentMonth.value = carrentMonth.value.map((res, index) => {
            if (Object.keys(carrentEvent.value).includes(String(index))) {
              res = carrentEvent.value[String(index)]
            }
            return res
          })
          console.log('正式数据', carrentMonth.value)
        })
    }
    return {
      userInfo,
      islogin,
      close,
      props,
      getUserProfile,
      unLogin,
      carrentDay,
      carrentTime,
      carrentMonth,
    }
  },
})
</script>

<style lang="scss">
.left_draw {
  animation: openDraw 0.3s ease 0s 1 normal forwards;
  position: relative;
  z-index: 100;
  @keyframes openDraw {
    0% {
      opacity: 0;
      margin-left: -100%;
    }
    100% {
      opacity: 1;
      margin-left: 0px;
    }
  }
  .left_draw_back {
    position: fixed;
    z-index: 100;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
  }
  .left_draw_center {
    position: relative;
    z-index: 101;
    background-color: #66cccc;
    height: 100vh;
    width: 280px;
    .user_info {
      padding-top: 80px;
      padding-left: 20px;
      display: flex;
      align-items: center;
      .info_img {
        width: 72px;
        height: 72px;
        background: #fbfbfb;
        border-radius: 100%;
      }
      .info_data {
        margin-left: 10px;
        .info_user {
          font-size: 17px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #f4f4f4;
          line-height: 24px;
        }
        .unfo_label {
          margin-top: 10px;
          background: #666699;
          border-radius: 6px;
          font-size: 15px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #f4f4f4;
          line-height: 22px;
          text-align: center;
        }
      }
      .info_unlogin {
        margin-left: 10px;
        font-size: 17px;
      }
    }
    .time_text {
      margin-top: 8px;
      padding-left: 20px;
      font-size: 14px;
      color: #ffffff;
      .time_number {
        font-size: 24px;
      }
    }
    .time_tabel_com {
      margin-top: 35px;
      margin-left: 12px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      .table_text {
        font-size: 13px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #ffffff;
      }
      .table_con {
        margin-top: 6px;
        padding: 8px;
        background: #666699;
        box-shadow: 2px 1px 9px 0px rgba(102, 102, 153, 1);
        border-radius: 12px;
        .table_con_list {
          display: grid;
          grid-template-columns: repeat(10, 20px);
          grid-template-rows: repeat(4, 20px);
          grid-row-gap: 5px;
          grid-column-gap: 5px;
          .table_item {
            background-color: white;
            border-radius: 4px;
          }
          .data_item {
            background: linear-gradient(132deg, #cefcfc 0%, #66cccc 100%);
            box-shadow: 2px 1px 9px 0px rgba(102, 102, 153, 1);
          }
        }
      }
    }
    .menu_list {
      margin-top: 25px;
      .list_item {
        border-bottom: 1px solid #fff;
        position: relative;
        display: flex;
        align-items: center;
        height: 35px;
        .item_icon {
          margin-left: 8px;
          width: 18px;
          height: 18px;
        }
        .item_text {
          margin-left: 8px;
          font-size: 13px;
          font-weight: 400;
          color: #ffffff;
        }
        .item_next {
          width: 11px;
          height: 11px;
        }
      }
    }
    .un_login {
      position: absolute;
      left: 50%;
      transform: translate(-50%, 0);
      bottom: 40px;
      width: 219px;
      line-height: 40px;
      background: #ffffff;
      border-radius: 9px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #666699;
    }
  }
}
</style>
