<template>
  <view class="container blue">
    <!-- 顶部一行：左半是语言按钮，右半是轮播图（没有轮播图时右半留空，语言按钮始终在） -->
    <view class="swiper-container">
      <view class="lang-panel">
        <view class="lang-row"><lang-switch /></view>
        <view class="shop-entry" @tap="goShop">
          <image src="/static/icon/shop.png" class="shop-entry-icon" mode="aspectFit"></image>
          <text class="shop-entry-text">{{ $t('home.shop') }}</text>
        </view>
      </view>
      <swiper v-if="carousels.length > 0" class="swiper" circular autoplay interval="5000" duration="500">
        <swiper-item v-for="(item, index) in carousels" :key="index" @tap="handleBannerClick(item)">
          <image :src="getUnifiedCloudUrl(item.imageUrl)" mode="aspectFill" class="swiper-image"></image>
        </swiper-item>
      </swiper>
    </view>
    
    <!-- 分隔：轮播图和分类列表之间的小标题（有分类时才显示） -->
    <view class="section-title" v-if="categories.length > 0">
      <view class="section-line left"></view>
      <text class="section-text">{{ $t('home.categories') }}</text>
      <view class="section-line right"></view>
    </view>

    <view class="category-list">
      <view 
        class="category-item" 
        v-for="item in categories" 
        :key="item.id"
        @tap="navigateToCatalog(item)"
      >
        <view class="category-content">
          <view class="category-name" :class="{ compact: isEn }">{{item.name}}</view>
        </view>
      </view>
    </view>
    
    <retry-state v-if="loadError && categories.length === 0" @retry="loadCategories" />
  </view>
</template>

<script>
import { getCategories, getCarousels } from '@/api/index.js';
import shareMixin from '@/mixins/share.js';
import { t, getLang } from '@/utils/i18n.js';
import { readData, writeData } from '@/utils/cache.js';
import { safeNavigate } from '@/utils/nav.js';
import RetryState from '@/components/RetryState.vue';
import LangSwitch from '@/components/LangSwitch.vue';
import { getUnifiedCloudUrl } from '@/utils/common.js';

export default {
  mixins: [shareMixin],
  components: { RetryState, LangSwitch },
  data() {
    return {
      categories: [],
      carousels: [],
      loadError: false
    }
  },
  computed: {
    // 英文名比中文长，字号小一点、允许换行
    isEn() {
      return getLang() !== 'zh';
    }
  },
  onLoad() {
    this.loadCached();
    // 加载最新数据
    this.loadCategories();
    this.loadCarousels();
  },
  methods: {
    getUnifiedCloudUrl,
    // 先显示当前语言的本地缓存（缓存按语言分开存）
    loadCached() {
      this.categories = readData('categories') || [];
      this.carousels = readData('carousels') || [];
    },
    // 切换语言（main.js 的全局 mixin 调用）：先清掉上一种语言的内容，再显示新语言的缓存并重新请求
    reloadForLang() {
      this.loadError = false;
      this.loadCached();
      this.loadCategories();
      this.loadCarousels();
    },
    async loadCategories() {
      this.loadError = false;
      // 请求发出时的语言：响应回来时用户可能已经切换了语言，旧语言的结果只写进旧语言的缓存，不能显示出来
      const lang = getLang();
      try {
        const {data} = await getCategories();
        
        if (data.code === 0) {
          // 根据sort_order字段从小到大排序
          const categories = data.data.sort((a, b) => a.sort_order - b.sort_order);
          writeData('categories', categories, lang);
          if (lang === getLang()) this.categories = categories;
        } else if (lang === getLang()) {
          this.loadError = true;
          uni.showToast({
            title: t('home.categoryFail'),
            icon: 'none'
          });
        }
      } catch (e) {
        if (lang === getLang()) this.loadError = true;
      }
    },
    async loadCarousels() {
      const lang = getLang();
      try {
        const {data} = await getCarousels();
        
        if (data.code === 0) {
          writeData('carousels', data.data, lang);
          if (lang === getLang()) this.carousels = data.data;
        } else {
          // 轮播图加载失败不影响主流程，保留已有缓存
        }
      } catch (e) {
        // 轮播图加载失败不影响主流程，保留已有缓存
      }
    },
    navigateToCatalog(category) {
      safeNavigate(`/pages/catalog/index?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`);
    },
    goShop() {
      safeNavigate('/pages/shop/index');
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
                title: t('home.linkCopied'),
                icon: 'none'
              });
            }
          });
        } else {
          // 内部页面跳转
          safeNavigate(item.link);
        }
      }
    },
    // 自定义首页分享内容
    onShareAppMessage() {
      return {
        title: t('share.title'),
        path: '/pages/home/index',
        success: function(res) {
          uni.showToast({
            title: t('share.ok'),
            icon: 'success'
          });
        },
        fail: function(res) {
          uni.showToast({
            title: t('share.fail'),
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
    display: flex;
    padding: 20rpx;

    // 左右各占一半（中间留 20rpx 间距）
    .lang-panel {
      width: calc(50% - 10rpx);
      height: 300rpx;
      margin-right: 20rpx;
      display: flex;
      flex-direction: column;

      // 上面一行：中文 / English；下面一行：商城入口
      .lang-row {
        flex: 1;
      }

      .shop-entry {
        flex: 1;
        margin-top: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #00a8ff, #0072ff);
        border-radius: 16rpx;

        &:active {
          transform: scale(0.98);
        }

        .shop-entry-icon {
          width: 44rpx;
          height: 44rpx;
          margin-right: 12rpx;
        }

        .shop-entry-text {
          color: #fff;
          font-size: 34rpx;
          font-weight: 700;
        }
      }
    }

    .swiper {
      width: calc(50% - 10rpx);
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
  
  // 小标题：文字居中，两侧各一条向外渐隐的蓝色细线
  .section-title {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8rpx 20rpx 24rpx;

    .section-line {
      width: 80rpx;
      height: 2rpx;

      &.left {
        background: linear-gradient(to right, rgba(0, 168, 255, 0), #00a8ff);
      }

      &.right {
        background: linear-gradient(to left, rgba(0, 168, 255, 0), #00a8ff);
      }
    }

    .section-text {
      margin: 0 24rpx;
      font-size: 32rpx;
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .category-list {
    padding: 0 20rpx;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    
    .category-item {
      display: flex; // 同一行的两个按钮等高（名称换行时另一个按钮跟着变高），内容区撑满
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
        flex: 1;
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
          @include text-clamp(3);
          max-width: 100%;
          line-height: 1.3;
          letter-spacing: 1px;

          &.compact {
            font-size: 30rpx;
            letter-spacing: 0;
          }
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