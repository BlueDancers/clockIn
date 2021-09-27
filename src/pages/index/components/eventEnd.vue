<template>
  <view class="event_end" v-show="eventEndShow">
    <view class="event_end_back" @click="close"></view>
    <view class="event_end_modal">
      <view class="modal_header"></view>
      <image class="modal_header_back" src="../../../images/end_header_back.png"></image>
      <view class="header_time">
        本次累计学习
        <text v-if="eventTime[0] > 0">{{ eventTime[0] }}小时</text>
        {{ eventTime[1] }}分钟
      </view>
      <view class="header_title">今天都学习了什么呢？</view>
      <textarea class="textarea" v-model="endForm.endText" placeholder="英语 ..高数....."></textarea>
      <!-- 照片 -->
      <view class="img_list">
        <view class="upload_img" @click="uploadImg">
          <image class="upload_icon" src="../../../images/add_image.png"></image>
        </view>
        <image class="upload_img" v-for="item in showImg" :key="item" :src="item"> </image>
      </view>
      <button class="event_end_btn" @click="successEnd">确认</button>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, reactive, Ref, ref, watch, watchEffect } from 'vue'
import Taro from '@tarojs/taro'
import { formatTimeArray, parseTime } from '../../../utils'
export default defineComponent({
  props: ['eventEndShow', 'timeCore'],
  setup(props, { emit }) {
    watchEffect(() => {
      if (props.eventEndShow) {
        console.log('打开了')
        let { startTime, endTime } = props.timeCore.data
        eventTime.value = formatTimeArray(new Date(endTime).getTime() - new Date(startTime).getTime())
      }
    })
    const db = Taro.cloud.database()
    const endForm = reactive({
      endText: '',
      imgs: [] as any[],
    })
    const showImg: Ref<string[]> = ref([]) // 真正显示的
    const eventTime: Ref<any[]> = ref([])
    // taro里面使用watch会出现问题
    function close() {
      endForm.endText = ''
      endForm.imgs = []
      emit('close')
    }
    function uploadImg() {
      Taro.setStorageSync('upImgShow', true)
      Taro.chooseImage({
        sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: (res) => {
          Taro.showLoading({
            title: '上传中',
          })
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          let filePath: any = res.tempFilePaths[0]
          const name = Taro.getStorageSync('userInfo')._openid + '-' + Date.now()
          const cloudPath = name + filePath.match(/\.[^.]+?$/)[0]
          console.log(filePath, name, cloudPath)

          Taro.cloud.uploadFile({
            cloudPath, //云存储图片名字
            filePath, //临时路径
            success: (res) => {
              console.log('[上传图片] 成功：', res)
              endForm.imgs.push(res.fileID || '')
              getImgUrl(endForm.imgs)
            },
            fail: (e) => {
              console.error('[上传图片] 失败：', e)
            },
            complete: () => {
              Taro.hideLoading()
              Taro.setStorageSync('upImgShow', false)
            },
          })
        },
      })
    }
    function getImgUrl(fileList) {
      Taro.cloud
        .getTempFileURL({
          fileList,
        })
        .then((res) => {
          showImg.value = res.fileList.map((e) => e.tempFileURL)
          console.log(props.timeCore)
        })
    }
    /**
     * 提交数据
     */
    async function successEnd() {
      if (!endForm.endText) {
        Taro.showToast({
          title: '请填写今日学习内容',
          icon: 'none',
        })
        return
      }
      console.log({
        data: {
          endTime: props.timeCore.data.endTime,
          eventText: endForm.endText,
          imgs: endForm.imgs,
        },
      })
      // 更新todo
      // 更新用户全局数据
      // 更新用户具体时间记录
      Promise.all([updateTodo(), updateUserTime(), updateTimeTable()])
        .then((res) => {
          console.log('数据更新成功', res)
          emit('endEvent')
          close()
        })
        .catch((err) => {
          console.log(err)
        })
    }
    function updateTodo() {
      return (db as any)
        .collection('todo')
        .where({
          _id: props.timeCore.data._id,
        })
        .update({
          data: {
            endTime: props.timeCore.data.endTime,
            eventText: endForm.endText,
            imgs: endForm.imgs,
          },
        })
    }
    function updateUserTime() {
      let { endTime, startTime } = props.timeCore.data
      let carryTime = new Date(endTime).getTime() - new Date(startTime).getTime()
      return (db as any)
        .collection('user')
        .where({
          _openid: props.timeCore.data._openid,
        })
        .update({
          data: {
            alltime: db.command.inc(carryTime),
          },
        })
    }
    // 更新
    function updateTimeTable() {
      let y = parseTime(Date.now(), '{y}')
      let m = parseTime(Date.now(), '{m}')
      let d = parseTime(Date.now(), '{d}')
      let { endTime, startTime } = props.timeCore.data
      let carryTime = new Date(endTime).getTime() - new Date(startTime).getTime()

      db.collection('eventTime')
        .where({
          _openid: props.timeCore.data._openid,
        })
        .get()
        .then((res) => {
          if (res.data.length == 0) {
            // 无数据,初始化数据
            return db.collection('eventTime').add({
              data: {
                timeObj: {
                  [y]: { [m]: { [d]: carryTime } },
                },
              },
            })
          } else {
            let data = res.data[0]
            // 更新数据
            try {
              if (data.timeObj[y][m][d]) {
                data.timeObj[y][m][d] = data.timeObj[y][m][d] + carryTime
              } else {
                data.timeObj[y][m][d] = carryTime
              }
            } catch (error) {
              console.log('更新时间错误', error)
              data.timeObj[y][m][d] = carryTime
            }
            return (db as any)
              .collection('eventTime')
              .where({
                _id: data._id,
              })
              .update({
                data: {
                  timeObj: data.timeObj,
                },
              })
          }
        })
    }
    return {
      close,
      uploadImg,
      showImg,
      successEnd,
      eventTime,
      endForm,
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
    .modal_header_back {
      position: absolute;
      top: -46px;
      right: -30px;
      width: 105px;
      height: 115px;
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
      display: grid;
      grid-template-columns: 72px 72px 72px;
      grid-row-gap: 12px;
      grid-column-gap: 12px;
      margin-top: 12px;
      width: 244px;
      .upload_img {
        position: relative;
        width: 72px;
        height: 72px;
        background: #ffffff;
        border-radius: 5px;
        border: 1px dashed #a7a7a7;
        .upload_icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 30px;
        }
      }
    }
    .event_end_btn {
      margin-top: 45px;
      margin-bottom: 16px;
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
