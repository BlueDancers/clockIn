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
        <view v-else class="info_unlogin" @click="getUserProfile()">
          点击登录
        </view>
      </view>
      <!-- 距离目标 -->
      <view class="time_text">
        距离考研还差
        <text class="time_number">{{ kaoyan }}</text>
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
import { defineComponent, onMounted, ref, watchEffect } from 'vue'
import useTimeData from '../funData/TimeData'
import useUserData from '../funData/userData'
export default defineComponent({
  props: ['leftDrawShow'],
  setup(props, { emit }) {
    const timeData = useTimeData
    const userData = useUserData
    const kaoyan = ref(0)
    onMounted(() => {
      kaoyan.value = Math.ceil((new Date('2022/12/25').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    })
    watchEffect(() => {
      if (props.leftDrawShow && userData.islogin.value) {
        timeData.getEventInfo()
      }
    })
    function close() {
      emit('closeLeft')
    }
    return {
      close,
      props,
      kaoyan,
      ...userData,
      ...timeData,
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
      margin-left: 0%;
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
