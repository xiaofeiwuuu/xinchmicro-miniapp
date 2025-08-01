<template>
  <view class="container blue">
    <view class="header">
      <text class="title">URL转换工具</text>
    </view>
    
    <view class="content-card">
      <view class="input-group">
        <text class="label">输入URL：</text>
        <input 
          class="input" 
          type="text" 
          v-model="inputUrl" 
          placeholder="请输入COS或TCB格式的URL" 
        />
      </view>
      
      <view class="button-group">
        <button class="btn" @tap="convertToTcb">转换为TCB格式</button>
        <button class="btn" @tap="convertToCos">转换为COS格式</button>
        <button class="btn copy" @tap="copyResult">复制结果</button>
      </view>
      
      <view class="result-box">
        <text class="label">转换结果：</text>
        <view class="result">
          <text class="result-text" user-select>{{ resultUrl }}</text>
        </view>
      </view>
    </view>
    
    <view class="example-card">
      <text class="subtitle">示例链接：</text>
      <view class="example-item" @tap="setExample(1)">
        <text class="example-label">COS格式：</text>
        <text class="example-url" user-select>https://7072-prod-3gdwxhfn933cdfa7-1346623423.cos.ap-shanghai.myqcloud.com/web/files/1741697429500.png</text>
      </view>
      <view class="example-item" @tap="setExample(2)">
        <text class="example-label">TCB格式：</text>
        <text class="example-url" user-select>https://7072-prod-3gdwxhfn933cdfa7-1346623423.tcb.qcloud.la/web/files/1741697429500.png</text>
      </view>
    </view>
  </view>
</template>

<script>
import { convertCosToTcbUrl, convertTcbToCosUrl } from '@/utils/common.js';

export default {
  data() {
    return {
      inputUrl: '',
      resultUrl: ''
    }
  },
  methods: {
    convertToTcb() {
      if (!this.inputUrl) {
        uni.showToast({
          title: '请输入URL',
          icon: 'none'
        });
        return;
      }
      
      this.resultUrl = convertCosToTcbUrl(this.inputUrl);
      
      if (this.resultUrl === this.inputUrl) {
        // 如果没有变化，可能是格式不对
        if (!this.inputUrl.includes('cos.ap-shanghai.myqcloud.com')) {
          uni.showToast({
            title: '不是有效的COS格式URL',
            icon: 'none'
          });
        } else {
          uni.showToast({
            title: '已经是TCB格式',
            icon: 'none'
          });
        }
      } else {
        uni.showToast({
          title: '转换成功',
          icon: 'success'
        });
      }
    },
    convertToCos() {
      if (!this.inputUrl) {
        uni.showToast({
          title: '请输入URL',
          icon: 'none'
        });
        return;
      }
      
      this.resultUrl = convertTcbToCosUrl(this.inputUrl);
      
      if (this.resultUrl === this.inputUrl) {
        // 如果没有变化，可能是格式不对
        if (!this.inputUrl.includes('tcb.qcloud.la')) {
          uni.showToast({
            title: '不是有效的TCB格式URL',
            icon: 'none'
          });
        } else {
          uni.showToast({
            title: '已经是COS格式',
            icon: 'none'
          });
        }
      } else {
        uni.showToast({
          title: '转换成功',
          icon: 'success'
        });
      }
    },
    copyResult() {
      if (!this.resultUrl) {
        uni.showToast({
          title: '没有可复制的结果',
          icon: 'none'
        });
        return;
      }
      
      uni.setClipboardData({
        data: this.resultUrl,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          });
        }
      });
    },
    setExample(type) {
      if (type === 1) {
        this.inputUrl = 'https://7072-prod-3gdwxhfn933cdfa7-1346623423.cos.ap-shanghai.myqcloud.com/web/files/1741697429500.png';
      } else {
        this.inputUrl = 'https://7072-prod-3gdwxhfn933cdfa7-1346623423.tcb.qcloud.la/web/files/1741697429500.png';
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/common/style/common.scss';

.container {
  @include page-container;
  
  .header {
    padding: 40rpx 20rpx;
    
    .title {
      font-size: 40rpx;
      font-weight: bold;
      color: $text-primary;
    }
  }
  
  .content-card {
    @include card;
    padding: 30rpx;
    margin: 0 20rpx 30rpx;
    
    .input-group {
      margin-bottom: 30rpx;
      
      .label {
        font-size: 28rpx;
        color: $text-secondary;
        margin-bottom: 16rpx;
        display: block;
      }
      
      .input {
        width: 100%;
        height: 80rpx;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
        color: $text-primary;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-sizing: border-box;
        
        &::placeholder {
          color: $text-light;
        }
      }
    }
    
    .button-group {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30rpx;
      
      .btn {
        flex: 1;
        margin: 0 10rpx;
        height: 80rpx;
        line-height: 80rpx;
        background: rgba($primary-color, 0.1);
        color: $primary-color;
        font-size: 28rpx;
        border-radius: 12rpx;
        border: 1px solid rgba($primary-color, 0.2);
        
        &:first-child {
          margin-left: 0;
        }
        
        &:last-child {
          margin-right: 0;
        }
        
        &.copy {
          background: rgba($primary-color, 0.2);
        }
        
        &:active {
          opacity: 0.8;
        }
      }
    }
    
    .result-box {
      .label {
        font-size: 28rpx;
        color: $text-secondary;
        margin-bottom: 16rpx;
        display: block;
      }
      
      .result {
        padding: 20rpx;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12rpx;
        min-height: 120rpx;
        
        .result-text {
          font-size: 28rpx;
          color: $text-primary;
          word-break: break-all;
        }
      }
    }
  }
  
  .example-card {
    @include card;
    padding: 30rpx;
    margin: 0 20rpx;
    
    .subtitle {
      font-size: 32rpx;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: 20rpx;
      display: block;
    }
    
    .example-item {
      margin-bottom: 20rpx;
      padding: 20rpx;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12rpx;
      
      &:active {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .example-label {
        font-size: 28rpx;
        color: $text-secondary;
        margin-bottom: 10rpx;
        display: block;
      }
      
      .example-url {
        font-size: 26rpx;
        color: $primary-color;
        word-break: break-all;
      }
    }
  }
}
</style> 