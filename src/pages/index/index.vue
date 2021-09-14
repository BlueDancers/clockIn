<template>
  <view class="index">
    <view class="label_list">
      <view
        class="label_item"
        v-for="item in eventList"
        :key="item.title"
        :class="activeEvent == item.title ? 'active_item' : ''"
        @click="toggleTitle(item.title)"
      >
        <view class="item_title">{{ item.title }}</view>
      </view>
    </view>
    <view class="btn">
      <nut-button type="primary" @click="startTime">点我</nut-button>
    </view>
    <nut-toast :msg="msg" v-model:visible="show" :type="type" :cover="false" />
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
    const activeEvent = ref('学习')
    const eventList = ref([
      {
        image: '',
        title: '学习',
      },
      {
        image: '',
        title: '吃饭',
      },
      {
        image: '',
        title: '休息',
      },
      {
        image: '',
        title: '出去玩',
      },
      // {
      //   image: '',
      //   title: '谈恋爱',
      // },
    ])
    const state = reactive({
      msg: '欢迎使用 NutUI3.0 开发小程序',
      type: 'text',
      show: false,
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
    const toggleTitle = (title) => {
      activeEvent.value = title
    }

    return {
      ...toRefs(state),
      startTime,
      findServer,
      eventList,
      activeEvent,
      toggleTitle,
    }
  },
}
</script>

<style lang="scss">
page {
  background-image: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
}
.index {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  .label_list {
    display: flex;
    justify-content: center;
    align-items: center;
    .label_item {
      margin: 10rpx;
      width: 50px;
      border-radius: 5px;
      border: 1px solid rgb(0, 0, 0);
      .item_title {
        font-size: 28rpx;
      }
    }
    .active_item {
      background-color: #84c0cb;
      color: #fff;
      border: 1px solid #fff;
    }
  }
  .btn {
  }
}
</style>
