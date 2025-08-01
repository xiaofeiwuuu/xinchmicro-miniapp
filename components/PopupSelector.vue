<template>
  <view class="popup-selector" :class="{ 'show': show }">
    <view class="mask" @tap="handleClose"></view>
    <view class="content">
      <view class="header">
        <view class="left">
          <text class="back iconfont icon-left" v-if="showBack" @tap="handleBack"></text>
          <text class="title">{{title}}</text>
        </view>
        <text class="close" @tap="handleClose">×</text>
      </view>
      <view class="list-wrapper">
        <scroll-view scroll-y class="list">
          <template v-if="list && list.length > 0">
            <view 
              class="item" 
              v-for="item in list" 
              :key="item.id"
              :class="{ 'active': String(selectedId) === String(item.id) }"
              @tap="handleSelect(item)"
            >
              <text>{{item.name}}</text>
              <text class="iconfont icon-right" v-if="String(selectedId) === String(item.id)"></text>
            </view>
          </template>
          <view v-else class="empty-state">
            <text class="iconfont icon-empty"></text>
            <text class="empty-text">暂无数据</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    list: {
      type: Array,
      default: () => []
    },
    selectedId: {
      type: [String, Number],
      default: ''
    },
    showBack: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClose() {
      this.$emit('close');
    },
    handleSelect(item) {
      this.$emit('select', item);
    },
    handleBack() {
      this.$emit('back');
    }
  }
}
</script>

<style lang="scss">
@import '@/common/style/common.scss';

.popup-selector {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  visibility: hidden;
  
  &.show {
    visibility: visible;
    
    .mask {
      opacity: 1;
    }
    
    .content {
      transform: translateY(0);
    }
  }
  
  .mask {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .content {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: $card-background;
    border-radius: 24rpx 24rpx 0 0;
    transform: translateY(100%);
    transition: transform 0.3s ease;
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      
      .left {
        display: flex;
        align-items: center;
        
        .back {
          font-size: 32rpx;
          color: $text-secondary;
          margin-right: 20rpx;
          padding: 10rpx;
          
          &:active {
            opacity: 0.7;
          }
        }
        
        .title {
          font-size: 32rpx;
          color: $text-primary;
          font-weight: 500;
        }
      }
      
      .close {
        font-size: 40rpx;
        color: $text-secondary;
        padding: 0 20rpx;
        
        &:active {
          opacity: 0.7;
        }
      }
    }
    
    .list-wrapper {
      height: 400rpx;
      position: relative;
      
      .list {
        height: 100%;
        
        .empty-state {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40rpx 0;
          
          .iconfont {
            font-size: 80rpx;
            color: rgba(255, 255, 255, 0.2);
            margin-bottom: 20rpx;
          }
          
          .empty-text {
            font-size: 28rpx;
            color: $text-light;
          }
        }
        
        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 30rpx;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          
          text {
            font-size: 28rpx;
            color: $text-primary;
          }
          
          .iconfont {
            color: $primary-color;
            font-size: 24rpx;
          }
          
          &.active {
            background: rgba(255, 255, 255, 0.05);
            
            text:first-child {
              color: $primary-color;
            }
          }
          
          &:active {
            background: rgba(255, 255, 255, 0.05);
          }
        }
      }
    }
  }
}
</style> 