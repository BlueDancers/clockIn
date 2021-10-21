<template>
  <view class="user_target">
    <view class="target_item">
      <view class="title">目标名称:</view>
      <input v-model="targetTitle" maxlength="6" class="user_input" placeholder="请输入目标" />
    </view>
    <view class="target_item">
      <view class="title">目标时间:</view>
      <picker mode="date" class="user_input" @change="uploadTime" :value="targetTime">
        <input disabled="true" placeholder="请选择天数" :value="targetTime" />
      </picker>
    </view>
    <button class="target_btn" @click="setTarget">设定目标</button>
  </view>
</template>

<script lang="ts">
import Taro from '@tarojs/taro'
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  setup() {
    const db = Taro.cloud.database()
    const targetTitle = ref('')
    const targetTime = ref('')
    onMounted(() => {
      db.collection('user')
        .where({
          _openid: Taro.getStorageSync('userInfo')._openid,
        })
        .get()
        .then((res) => {
          targetTitle.value = res.data[0].targetTitle
          targetTime.value = res.data[0].targetTime
        })
    })
    // 设置目标
    function setTarget() {
      if (targetTitle.value == '') {
        Taro.showToast({
          title: '目标不能为空',
          icon: 'none',
        })
        return false
      }
      if (targetTime.value == '') {
        Taro.showToast({
          title: '目标时间不能为空',
          icon: 'none',
        })
        return false
      }
      ;(db as any)
        .collection('user')
        .where({
          _openid: Taro.getStorageSync('userInfo')._openid,
        })
        .update({
          data: {
            targetTitle: targetTitle.value,
            targetTime: targetTime.value,
          },
        })
        .then((res) => {
          console.log(res)
          Taro.showToast({
            title: '设定成功',
            icon: 'none',
          })
          setTimeout(() => {
            Taro.navigateBack({
            delta: 1,
          })  
          }, 1000);
          
        })
    }
    function uploadTime(event) {
      targetTime.value = event.detail.value
    }
    return { targetTitle, targetTime, setTarget, uploadTime }
  },
})
</script>

<style lang="scss">
page {
  background: #fff;
}
.user_target {
  .target_item {
    display: flex;
    height: 40px;
    align-items: center;
    .title {
      width: 140px;
      text-align: right;
    }
    .user_input {
      margin-left: 10px;
      width: 540px;
    }
  }
  .target_btn {
    margin: 10px;
    background-color: #66cccc;
    color: #fff;
  }
}
</style>
