<template>
  <view class="index">
    <view>
      <img src="" alt="" />
    </view>
    <view class="btn">
      <nut-button type="primary" @click="startTime">点我</nut-button>
    </view>
    <nut-toast :msg="msg" v-model:visible="show" :type="type" :cover="false" />
  </view>
</template>

<script lang="ts">
import { reactive, toRefs } from 'vue'
import { todoList } from '../../database'
import { parseTime } from '../../utils'
import Taro from '@tarojs/taro'
export default {
  name: 'Index',
  components: {},
  setup() {
    const db = Taro.cloud.database()
    const state = reactive({
      msg: '欢迎使用 NutUI3.0 开发小程序',
      msg2: '你成功了～',
      type: 'text',
      show: false,
    })
    // 获取是否存在运行中的todo
    const startTime = () => {
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
    }

    return {
      ...toRefs(state),
      startTime,
    }
  },
}
</script>

<style lang="scss">
.index {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
