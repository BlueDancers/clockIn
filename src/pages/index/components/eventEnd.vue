<template>
  <view class="event_end" v-show="eventEndShow">
    <view class="event_end_back" @click="close"></view>
    <view class="event_end_modal">
      <view class="modal_header"></view>
      <view class="header_time">本次累计学习xx小时xx分钟</view>
      <view class="header_title">今天都学习了什么呢？</view>
      <textarea class="textarea" placeholder="英语 ..高数....."></textarea>
      <!-- 照片 -->
      <view class="img_list">
        <view class="upload_img"></view>
      </view>
      <button class="event_end_btn">确认</button>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: ['eventEndShow'],
  setup(props, { emit }) {
    console.log(props)

    function close() {
      emit('close')
    }
    return {
      close,
    }
  },
})
</script>

<style lang="scss">
.event_end {
  .event_end_back {
    position: fixed;
    z-index: 100;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
  }
  .event_end_modal {
    z-index: 101;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 284px;
    height: 418px;
    background: #ffffff;
    border-radius: 13px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .modal_header {
      position: absolute;
      top: 0px;
      left: 0px;
      width: 284px;
      height: 114px;
      background-color: #66cccc;
      border-radius: 11px 11px 0px 0px;
    }
    .header_time {
      margin-top: 24px;
      position: relative;
      z-index: 10;
      text-align: center;
      font-size: 18px;
      font-weight: 400;
      color: #ffffff;
    }
    .header_title {
      margin-top: 22px;
      position: relative;
      z-index: 10;
      text-align: center;
      font-size: 20px;
      font-weight: 400;
      color: #ffffff;
    }
    .textarea {
      margin-top: 36px;
      padding: 6px;
      width: 232px;
      height: 108px;
      background: #ececec;
      border-radius: 3px;
    }
    .img_list {
      margin-top: 12px;
      width: 232px;
      .upload_img {
        width: 63px;
        height: 63px;
        background: #ffffff;
        border-radius: 5px;
        border: 1px dashed #a7a7a7;
      }
    }
    .event_end_btn {
      margin-top: 45px;
      width: 212px;
      height: 31px;
      line-height: 31px;
      background-color: #66cccc;
      border-radius: 4px;
      font-size: 15px;
      color: #ffffff;
      border: 1px solid #fff;
      &::after {
        border: none;
      }
    }
  }
}
</style>
