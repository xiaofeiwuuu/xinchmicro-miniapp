<template>
  <view class="container">
    <view class="catalog-list" v-if="catalogs.length > 0">
      <view 
        class="catalog-item" 
        v-for="item in catalogs" 
        :key="item.id"
        @tap="navigateToProducts(item)"
      >
        <view class="catalog-content">
          <text class="catalog-name">{{item.name}}</text>
        </view>
      </view>
    </view>
    <view class="loading-state" v-if="isLoading">
      <text class="loading-text">请求数据中...</text>
    </view>
    <view class="empty-state" v-if="!isLoading && catalogs.length === 0">
      <text class="iconfont icon-empty"></text>
      <text class="empty-text">暂无产品目录</text>
    </view>
  </view>
</template>

<script>
import { getCatalogs } from '@/api/index.js';

export default {
  data() {
    return {
      categoryId: '',
      categoryName: '',
      catalogs: [],
      isLoading: true
    }
  },
  onLoad(options) {
    this.categoryId = options.categoryId;
    this.categoryName = options.categoryName;
    uni.setNavigationBarTitle({
      title: this.categoryName
    });
    this.loadCatalogs();
  },
  methods: {
    async loadCatalogs() {
      this.isLoading = true;
      try {
        const {data} = await getCatalogs({
          categoryId: this.categoryId
        });
        if (data.code === 0) {
          this.catalogs = data.data;
        } else {
          uni.showToast({
            title: '获取目录失败',
            icon: 'none'
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },
    navigateToProducts(catalog) {
      uni.navigateTo({
        url: `/pages/product/list?catalogId=${catalog.id}&catalogName=${catalog.name}`
      });
    }
  }
}
</script>

<style lang="scss">
@import '@/common/style/common.scss';

.container {
  @include page-container;
  padding: 20rpx;
}

.catalog-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  
  .catalog-item {
    width: calc(50% - 20rpx);
    margin-bottom: 20rpx;
    background: $card-background;
    border-radius: 16rpx;
    border: 1px solid rgba(255, 255, 255, 0.05);
    // backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    overflow: hidden;
    
    .catalog-content {
      padding: 8rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80rpx;
      
      .catalog-name {
        font-size: 36rpx;
        color: $text-primary;
        font-weight: 500;
        text-align: center;
        @include text-ellipsis;
        max-width: 100%;
        letter-spacing: 1px;
      }
    }
    
    &:active {
      transform: scale(0.98);
      background: lighten($card-background, 3%);
    }
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  .loading-text {
    font-size: 28rpx;
    color: $text-light;
    letter-spacing: 1px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
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
</style> 