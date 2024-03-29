<template>
  <view class="index">
    <!-- 侧边栏开关 -->
    <view @click="openLeft">
      <image class="open_menu" :style="{ top: `${barHeight + 10}px` }" src="../../images/menu.png"></image>
    </view>

    <!-- 分享给某人 -->
    <button class="share_dom" open-type="share">
      发送给某人
    </button>
    <!-- 背景时钟 -->
    <image class="time_back" src="../../images/time.png"></image>
    <!-- 当前时间 -->
    <view class="carrent_time" v-if="timeStatus == 1">
      <text>{{ carrentTime }}</text>
    </view>
    <!-- 进行中的学习 -->
    <view class="time_online" v-if="timeStatus == 2">
      <view class="online_title">已进行</view>
      <view class="this_time">{{ onLineTime }}</view>
    </view>
    <!-- 按钮 -->
    <view class="start_btn" @click="handleEvent">
      <text class="start_btn_text" v-if="timeStatus == 1">开始学习</text>
      <text class="start_btn_text" v-if="timeStatus == 2">结束学习</text>
    </view>
    <!-- 底部 -->
    <view class="index_bottom">
      <!-- 流星 -->
      <image class="bottom_item item1" src="../../images/lx.png" mode="" />
      <image class="bottom_item item2" src="../../images/lx.png" mode="" />
      <image class="bottom_item item3" src="../../images/lx.png" mode="" />
      <image class="bottom_item item4" src="../../images/lx.png" mode="" />
      <image class="bottom_item item5" src="../../images/lx.png" mode="" />
      <image class="bottom_item item6" src="../../images/lx.png" mode="" />
      <image class="bottom_item item7" src="../../images/lx.png" mode="" />
      <image class="bottom_item item8" src="../../images/lx.png" mode="" />
      <!-- 每日金句 -->
      <view class="bottom_text_com">
        <text class="bottom_text">No man needs a vacation much as the man who has just had one.</text>
        <image class="bottom_text_icon" src="../../images/fy.png"></image>
      </view>
    </view>
    <!-- 侧边栏 -->
    <left-draw :leftDrawShow="leftDrawShow" @closeLeft="closeLeft"></left-draw>
    <!-- 学习结束弹窗 -->
    <event-end
      :eventEndShow="eventEndShow"
      :timeCore="timeCore"
      @close="closeEventEnd"
      @endEvent="endEvent"
    ></event-end>
  </view>
</template>

<script lang="ts">
import Taro from '@tarojs/taro'
import { reactive, Ref, ref, toRefs } from 'vue'
import { todoList } from '../../database'
import leftDraw from './components/leftDraw.vue'
import eventEnd from './components/eventEnd.vue'
import useLeftDraw from './funData/leftDraw'
import useIndexTime from './funData/index_time'
import useBarHeight from './funData/barHeight'
import useEventEnd from './funData/eventEnd'
import { parseTime, formatTimeArray } from '../../utils/index'

export default {
  name: 'Index',
  components: {
    leftDraw,
    eventEnd,
  },
  onShow() {
    // 获取是否存在运行中的todo
    let upImgShow = Taro.getStorageSync('upImgShow') // 是否在上传图片
    let login = Taro.getStorageSync('login') // 当前是否登录
    if (!upImgShow && login) {
      this.findServer()
    } else {
      setTimeout(() => {
        this.endEvent() // 开始时间倒计时
      }, 200)
    }
  },
  // 用户分享
  onShareAppMessage() {
    return {
      title: '今天你学习了吗?',
      path: `/pages/index/index`,
    }
  },
  onShareTimeline() {
    return {
      title: '今天你学习了吗?',
    }
  },
  setup() {
    const db = Taro.cloud.database()
    const timeData = useIndexTime() // 时间对象
    const barHeight = useBarHeight() // 获取状态高度
    const leftDraw = useLeftDraw() // 侧边栏
    const eventEnd = useEventEnd() // 结束弹窗
    let timeCore = reactive({
      data: {
        _id: '',
        _openid: '',
        date: '',
        startTime: '',
        endTime: '',
        event: '',
        imgs: [],
        eventText: '',
      } as todoList,
    }) // 正在进行中的事件
    const timeStatus = ref(0) // 0未开始 1 未开始 2 进行中
    // 开始/结束事件
    const handleEvent = async () => {
      if (!Taro.getStorageSync('login')) {
        Taro.showToast({
          title: '还没有登录呢',
          icon: 'none',
        })
        // 未登录打开侧边栏
        leftDraw.openLeft()
        return
      }
      // 查询服务端是否存在未完成数据
      if (timeStatus.value == 1) {
        // 首先查询是否存在正在执行中的任务
        let isOnStart = await db
          .collection('todo')
          .where({
            _openid: Taro.getStorageSync('userInfo')._openid,
            endTime: '',
          })
          .get()
        if (isOnStart.data.length != 0) {
          Taro.showToast({
            title: '当前存在未结束任务,请联系客服协助解决问题',
            icon: 'none',
          })
          return false
        }
        let data = {
          date: parseTime(new Date(), '{y}-{m}-{d}'),
          startTime: parseTime(new Date()),
          endTime: '',
          event: '学习', // 事件
          imgs: [], // 效果图片
          eventText: '', // 说明文字
        }
        let _openid = Taro.getStorageSync('userInfo')._openid
        db.collection('todo')
          .add({
            data: data,
          })
          .then((res: any) => {
            timeStatus.value = 2
            timeCore.data = { ...data, _id: res._id, _openid: _openid }
            timeData.startOnLine(data)
            timeData.clearCarrent()
            Taro.showToast({
              title: '开始学习~',
              icon: 'none',
            })
          })
      } else {
        timeCore.data.endTime = parseTime(new Date())
        console.log('填充结束时间', timeCore.data)
        eventEnd.openEventEnd() // 打开学习接触弹窗
      }
    }
    function endEvent() {
      timeStatus.value = 1
      timeData.startCarrent() // 开始时间倒计时
      timeData.clearonLine() // 停止学习计时器
    }
    // 检查服务端时间
    const findServer = async () => {
      db.collection('todo')
        .where({
          _openid: Taro.getStorageSync('userInfo')._openid,
          endTime: '',
        })
        .get()
        .then((res: any) => {
          console.log('获取到的服务端数据', res.data)
          if (res.data.length) {
            // 存在进行中的任务
            timeStatus.value = 2
            timeData.startOnLine(res.data[0])
            timeCore.data = res.data[0]
          } else {
            timeStatus.value = 1
            timeData.startCarrent()
          }
        })
    }
    return {
      timeStatus,
      ...timeData,
      ...barHeight,
      ...leftDraw,
      ...eventEnd,
      handleEvent,
      findServer,
      timeCore,
      endEvent,
    }
  },
}
</script>

<style lang="scss">
page {
  background: #66cccc;
}
.index {
  position: relative;
  height: 100vh;
  .open_menu {
    position: absolute;
    top: 40px;
    left: 20px;
    width: 24px;
    height: 24px;
  }
  .share_dom {
    position: absolute;
    z-index: 10;
    padding: 0px;
    top: 120px;
    right: 0px;
    width: 79px;
    height: 24px;
    line-height: 24px;
    background: #ffffff;
    border-radius: 91px 0px 0px 91px;
    text-align: center;
    font-size: 13px;
    font-weight: 400;
    color: #666699;
  }
  .time_back {
    position: absolute;
    top: 0px;
    right: 0px;
    width: 217px;
    height: 256px;
  }
  .carrent_time {
    position: absolute;
    left: 50%;
    top: 150px;
    transform: translate(-50%, 0);
    font-size: 59px;
    font-weight: bold;
    color: #666699;
    font-family: 'myfont';
  }
  .time_online {
    position: absolute;
    left: 50%;
    top: 160px;
    transform: translate(-50%, 0);
    .online_title {
      position: relative;
      right: 10px;
      font-size: 22px;
      color: #666699;
    }
    .this_time {
      margin-top: 6px;
      font-size: 50px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: bold;
      color: #666699;
      font-family: 'myfont';
    }
  }
  .start_btn {
    position: absolute;
    z-index: 10;
    left: 50%;
    bottom: 250px;
    transform: translate(-50%, 0);
    width: 264px;
    height: 264px;
    border-radius: 100%;
    background: linear-gradient(180deg, #f1f1f1 0%, #a0dede 100%);
    box-shadow: 5px 9px 27px 0px rgba(255, 255, 255, 1);
    display: flex;
    justify-content: center;
    align-items: center;
    &:active {
      opacity: 0.8;
    }
    .start_btn_text {
      font-size: 43px;
      font-weight: 400;
      color: #666699;
    }
  }
  .index_bottom {
    position: absolute;
    z-index: 10;
    border-top-left-radius: 60% 30%;
    border-top-right-radius: 60% 30%;
    bottom: 0px;
    width: 375px;
    height: 186px;
    background: linear-gradient(180deg, #fbfbfb 0%, #66cccc 100%);
    box-shadow: 2px 4px 13px 0px rgba(255, 255, 255, 0.5);
    .bottom_item {
      position: absolute;
      width: 37px;
      height: 29px;
    }
    .item1 {
      bottom: 92px;
      left: -15px;
    }
    .item2 {
      bottom: 80px;
      left: 26px;
    }
    .item3 {
      bottom: 123px;
      left: 94px;
    }
    .item4 {
      bottom: 88px;
      left: 130px;
    }
    .item5 {
      bottom: 138px;
      left: 168px;
    }
    .item6 {
      bottom: 94px;
      left: 214px;
    }
    .item7 {
      bottom: 138px;
      right: 73px;
    }
    .item8 {
      bottom: 94px;
      right: 28px;
    }
    .bottom_text_com {
      position: absolute;
      left: 50%;
      bottom: 25px;
      transform: translate(-50%, 0);
      width: 296px;
      .bottom_text {
        font-family: 'myfont';
        font-size: 14px;
        font-weight: 400;
        color: #666699;
        line-height: 20px;
      }
      .bottom_text_icon {
        width: 12px;
        height: 12px;
      }
    }
  }
}
</style>
