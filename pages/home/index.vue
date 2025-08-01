<template>
  <view class="container blue">
    <!-- 轮播图 -->
    <view class="swiper-container" v-if="carousels.length > 0">
      <swiper class="swiper" circular autoplay interval="5000" duration="500" indicator-dots indicator-active-color="#00A8FF">
        <swiper-item v-for="(item, index) in carousels" :key="index" @tap="handleBannerClick(item)">
          <image :src="getUnifiedCloudUrl(item.imageUrl)" mode="aspectFill" class="swiper-image"></image>
        </swiper-item>
        <!-- 无数据时显示默认图片 -->
        <swiper-item v-if="carousels.length === 0">
          <image src="/static/images/default-banner.jpg" mode="aspectFill" class="swiper-image"></image>
        </swiper-item>
      </swiper>
    </view>
    
   <!-- <view class="header">
      <view class="title-wrapper">
        <text class="title-char" v-for="(char, index) in '产品分类'" :key="index" :style="{ animationDelay: index * 0.2 + 's' }">{{char}}</text>
      </view>
      <text class="subtitle">广泛应用于普通通信、电力、汽车电子、大数据、人工智能、仪器仪表等领域</text>
    </view> -->
    
    <view class="category-list">
      <view 
        class="category-item" 
        v-for="item in categories" 
        :key="item.id"
        @tap="navigateToCatalog(item)"
      >
        <view class="category-content">
          <text class="category-name">{{item.name}}</text>
        </view>
      </view>
    </view>
    
    <!-- 开发工具入口 -->
    <!-- <view class="dev-tools">
      <view class="tool-item" @tap="navigateToUrlConvert">
        <text class="tool-name">URL转换工具</text>
        <text class="tool-desc">COS/TCB链接格式转换</text>
      </view>
    </view> -->
  </view>
</template>

<script>
import { getCategories, getCarousels } from '@/api/index.js';
import shareMixin from '@/mixins/share.js';
import { getUnifiedCloudUrl } from '@/utils/common.js';

export default {
  mixins: [shareMixin],
  data() {
    return {
      categories: [],
      carousels: []
    }
  },
  onLoad() {
    // 加载本地缓存数据
    const categories = uni.getStorageSync('categories');
    if (categories) {
      this.categories = categories;
    } 
    
    const carousels = uni.getStorageSync('carousels');
    if (carousels) {
      this.carousels = carousels;
    }
    
    // 加载最新数据
    this.loadCategories();
    this.loadCarousels();
  },
  methods: {
    getUnifiedCloudUrl,
    async loadCategories() {
      try {
        const {data} = await getCategories();
        
        if (data.code === 0) {
          // 根据sort_order字段从小到大排序
          this.categories = data.data.sort((a, b) => a.sort_order - b.sort_order);
          uni.setStorageSync('categories', this.categories);
        } else {
          uni.showToast({
            title: '获取分类失败',
            icon: 'none'
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
    async loadCarousels() {
      try {
        const {data} = await getCarousels();
        
        if (data.code === 0) {
          this.carousels = data.data;
          uni.setStorageSync('carousels', this.carousels);
        } else {
          console.error('获取轮播图失败', data);
        }
      } catch (e) {
        console.error('获取轮播图异常', e);
      }
    },
    navigateToCatalog(category) {
      uni.navigateTo({
        url: `/pages/catalog/index?categoryId=${category.id}&categoryName=${category.name}`
      });
    },
    navigateToUrlConvert() {
      uni.navigateTo({
        url: '/pages/test/url-convert'
      });
    },
    handleBannerClick(item) {
      // 如果轮播图有链接，则跳转
      if (item.link) {
        // 判断是内部链接还是外部链接
        if (item.link.startsWith('http')) {
          // 复制外部链接到剪贴板
          uni.setClipboardData({
            data: item.link,
            success: () => {
              uni.showToast({
                title: '链接已复制，请在浏览器中打开',
                icon: 'none'
              });
            }
          });
        } else {
          // 内部页面跳转
          uni.navigateTo({
            url: item.link
          });
        }
      }
    },
    // 自定义首页分享内容
    onShareAppMessage() {
      return {
        title: '产品中心',
        path: '/pages/home/index',
        success: function(res) {
          uni.showToast({
            title: '分享成功',
            icon: 'success'
          });
        },
        fail: function(res) {
          uni.showToast({
            title: '分享失败',
            icon: 'none'
          });
        }
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/common/style/common.scss';

@keyframes lightUp {
  0%, 100% {
    color: rgba(255, 255, 255, 0.6);
    text-shadow: none;
  }
  15% {
    color: #fff;
    text-shadow: 0 0 10rpx rgba(255, 255, 255, 0.8);
  }
  30% {
    color: rgba(255, 255, 255, 0.6);
    text-shadow: none;
  }
}

.container {
  @include page-container;
  
  &.blue {
    .title-char {
      color: rgba(255, 255, 255, 0.8);
      animation: lightUp 5s ease-in-out infinite;
      font-weight: bold;
    }
  }
  
  .swiper-container {
    padding: 20rpx;
    
    .swiper {
      height: 300rpx;
      border-radius: 16rpx;
      overflow: hidden;
      box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15);
      
      .swiper-image {
        width: 100%;
        height: 100%;
      }
    }
  }
  
  .header {
    @include header-card;
    margin-top: 20rpx;
    
    .title-wrapper {
      display: flex;
      margin-bottom: 16rpx;
      
      .title-char {
        font-size: 48rpx;
        font-weight: bold;
        color: rgba(255, 255, 255, 0.8);
        animation: lightUp 5s ease-in-out infinite;
      }
    }
    
    .subtitle {
      font-size: 28rpx;
      color: $text-secondary;
    }
  }
  
  .category-list {
    padding: 0 20rpx;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    
    .category-item {
      width: calc(50% - 20rpx);
      margin-bottom: 20rpx;
      background: $card-background;
      border-radius: 16rpx;
      border: 1px solid rgba(255, 255, 255, 0.05);
      overflow: hidden;
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.98);
        background: lighten($card-background, 3%);
      }
      
      .category-content {
        padding: 8rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 80rpx;
        
        .category-name {
          font-size: 36rpx;
          color: $text-primary;
          font-weight: 500;
          text-align: center;
          @include text-ellipsis;
          max-width: 100%;
          letter-spacing: 1px;
        }
      }
    }
  }
  
  .dev-tools {
    padding: 20rpx;
    margin-top: 20rpx;
    
    .tool-item {
      background: $card-background;
      border-radius: 16rpx;
      padding: 30rpx;
      border: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.98);
        background: lighten($card-background, 3%);
      }
      
      .tool-name {
        font-size: 32rpx;
        color: $primary-color;
        font-weight: bold;
        margin-bottom: 10rpx;
      }
      
      .tool-desc {
        font-size: 24rpx;
        color: $text-secondary;
      }
    }
  }
}
</style> 