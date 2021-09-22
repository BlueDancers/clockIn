<template>
  <view class="index">
    <!-- 侧边栏开关 -->
    <image class="open_menu" :style="{ top: `${barHeight + 10}px` }" src="../../images/menu.png"></image>
    <!-- 分享给某人 -->
    <view class="share_dom">
      <text class="share_text">发送给某人</text>
    </view>
    <!-- 背景时钟 -->
    <image class="time_back" src="../../images/time.png"></image>
    <!-- 当前时间 -->
    <view class="carrent_time">18:30:20</view>
    <!-- 按钮 -->
    <!-- 底部 -->
    <view>
      <!-- 流星 -->
      <!-- 每日金句 -->
    </view>
  </view>
</template>

<script lang="ts">
import { reactive, ref, toRefs } from 'vue'
import { todoList } from '../../database'
import { parseTime } from '../../utils'
import Taro from '@tarojs/taro'
export default {
  name: 'Index',
  components: {},
  onShow() {
    // 获取是否存在运行中的todo
    this.findServer()
  },
  setup() {
    const db = Taro.cloud.database()
    const timeStatus = ref(false) // false false 不可以开始事件
    const barHeight = ref(0)
    const state = reactive({
      msg: '欢迎使用 NutUI3.0 开发小程序',
      type: 'text',
      show: false,
    })
    // 获取高度
    Taro.getSystemInfo({}).then((res) => {
      barHeight.value = res.statusBarHeight
    })
    const startTime = async () => {
      // 查询服务端是否存在未完成数据
      if (timeStatus.value) {
        db.collection('todo')
          .add({
            data: {
              openid: '',
              date: parseTime(new Date(), '{y}-{m}-{d}'),
              startTime: parseTime(new Date()),
              endTime: '',
              event: '学习',
            } as todoList,
          })
          .then((res) => {
            console.log(res)
          })
      } else {
        state.msg = '当前还存在未结束的事件~'
        state.show = true
      }
    }
    const findServer = async () => {
      db.collection('todo')
        .where({
          _openid: Taro.getStorageSync('userInfo')._openid,
          endTime: '',
        })
        .get()
        .then((res) => {
          if (res.data.length) {
            timeStatus.value = false
          } else {
            timeStatus.value = true
          }
          console.log(res)
        })
    }
    return {
      ...toRefs(state),
      barHeight,
      startTime,
      findServer,
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
    top: 140px;
    right: 0px;
    width: 79px;
    height: 24px;
    background: #ffffff;
    border-radius: 91px 0px 0px 91px;
    text-align: center;
    .share_text {
      line-height: 24px;
      font-size: 13px;
      font-weight: 400;
      color: #666699;
    }
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
    top: 130px;
    transform: translate(-50%, 0);
    font-size: 59px;
    font-weight: bold;
    color: #666699;
  }
}
</style>
