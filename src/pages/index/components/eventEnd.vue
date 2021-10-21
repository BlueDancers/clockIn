<template>
  <view class="event_end" v-show="eventEndShow">
    <view class="event_end_back" @click="close"></view>
    <view class="event_end_modal">
      <view class="modal_header"></view>
      <view class="modal_datas">
        <view class="data_item">
          <view class="item_title">本次学习</view>
          <view class="item_num">
            <view class="num">{{ eventTime }}</view>
            <view class="unit">min</view>
          </view>
        </view>
        <view class="data_item">
          <view class="item_title">累计时间</view>
          <view class="item_num">
            <view class="num">{{ carrentTime }}</view>
            <view class="unit">hours</view>
          </view>
        </view>
        <view class="data_item">
          <view class="item_title">累计天数</view>
          <view class="item_num">
            <view class="num">{{ carrentDay }}</view>
            <view class="unit">day</view>
          </view>
        </view>
      </view>
      <view class="modal_other">🌟星光不负赶路人</view>
      <textarea class="textarea" v-model="endForm.endText" placeholder="今天都学习了什么呢？"></textarea>
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
import { defineComponent, onMounted, reactive, Ref, ref, watch, watchEffect } from 'vue'
import Taro from '@tarojs/taro'
import { formatTimeArray, parseTime } from '../../../utils'
import useTimeData from '../funData/TimeData'
export default defineComponent({
  props: ['eventEndShow', 'timeCore'],
  setup(props, { emit }) {
    const db = Taro.cloud.database()
    const endForm = reactive({
      endText: '',
      imgs: [] as any[],
    })
    const showImg: Ref<string[]> = ref([]) // 真正显示的
    const eventTime: Ref<any> = ref(0)
    const timeData = useTimeData
    watchEffect(() => {
      if (props.eventEndShow) {
        let { startTime, endTime } = props.timeCore.data
        let diffTime = (new Date(endTime).getTime() - new Date(startTime).getTime()) % (1000 * 60 * 60)
        eventTime.value = Math.floor(diffTime / (1000 * 60))
        if (!timeData.carrentTime.value) {
          timeData.getEventInfo()
        }
      }
    })
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
      // 更新todo
      // 更新用户全局数据
      // 更新用户具体时间记录
      Promise.all([updateTodo(), updateUserTime(), updateTimeTable()])
        .then((res) => {
          Taro.showToast({
            title: '记录成功~',
            duration: 1500,
          })
          console.log('恭喜你完成本次记录~', res)
          setTimeout(() => {
            emit('endEvent')
            timeData.getEventInfo()
            close()
          }, 1400)
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
      console.log('查询参数', {
        _openid: props.timeCore.data._openid,
        [`timeObj-${y + 1}-${m}`]: d,
      })
      return db
        .collection('eventTime')
        .where({
          _openid: props.timeCore.data._openid,
        })
        .count()
        .then((res) => {
          if (res.total == 0) {
            // 无数据,初始化数据
            return db.collection('eventTime').add({
              data: {
                timeObj: { [y]: { [m]: { [d]: carryTime } } },
              },
            })
          } else {
            return (db as any)
              .collection('eventTime')
              .where({
                _openid: props.timeCore.data._openid,
              })
              .update({
                data: {
                  [`timeObj.${y}.${m}.${d}`]: db.command.inc(carryTime),
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
      ...timeData,
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
      border-radius: 11px 11px 0px 0px;
      background-image: url('../../../images/end_header.png');
      background-size: 100% 100%;
    }
    .modal_datas {
      position: relative;
      z-index: 101;
      margin-top: 20px;
      width: 100%;
      display: flex;
      justify-content: space-around;
      align-items: center;
      font-family: 'myfont';
      .data_item {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #ffffff;
        .item_title {
          font-size: 13px;
          font-weight: 400;
        }
        .item_num {
          margin-top: 6px;
          display: flex;
          align-items: flex-end;
          .num {
            font-size: 18px;
            font-weight: bold;
          }
          .unit {
            margin-left: 4px;
            font-size: 13px;
            font-weight: 500;
          }
        }
      }
    }
    .modal_other {
      position: relative;
      z-index: 101;
      width: 100%;
      padding-right: 20px;
      text-align: right;
      margin-top: 16px;
      font-size: 12px;
      font-weight: 400;
      color: #ffffff;
    }
    .header_title {
    }
    .textarea {
      font-size: 14px;
      margin-top: 30px;
      padding: 6px;
      width: 246px;
      height: 108px;
      background: #ececec;
      border-radius: 3px;
    }
    .img_list {
      display: grid;
      grid-template-columns: 72px 72px 72px;
      grid-row-gap: 12px;
      grid-column-gap: 12px;
      margin-top: 8px;
      width: 256px;
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
      .upload_img {
      }
    }
    .event_end_btn {
      margin-top: 45px;
      margin-bottom: 16px;
      width: 242px;
      height: 38px;
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
