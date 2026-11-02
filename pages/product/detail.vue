<template>
  <view class="container">
    <view class="product-detail" v-if="product">
      <!-- 产品基本信息 -->
      <view class="header-card">
        <view class="product-info">
          <text class="product-name">{{ product.name }}</text>
          <text class="catalog-name" v-if="product.catalog">{{ product.catalog.name }}</text>
        </view>
      </view>

      <!-- 产品参数列表 -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">{{ $t('detail.params') }}</text>
        </view>
        <view class="params-list">
          <!-- 适配新的 paramTitles 格式 [{id, title}] -->
          <view class="param-item" v-for="param in paramTitlesList" :key="param.id || param">
            <text class="param-label">{{ param.title || param }}</text>
            <text class="param-value">{{ getParamValue(param) }}</text>
          </view>
        </view>
      </view>

      <!-- PDF文档 -->
      <view class="section-card" v-if="product.pdfUrl">
        <view class="section-header">
          <text class="section-title">{{ $t('detail.techDocs') }}</text>
        </view>
        <!-- 当链接正在加载时显示加载中状态 -->
        <view class="pdf-loading" v-if="isLoadingPdf">
          <text class="iconfont icon-loading loading-icon"></text>
          <text class="loading-text">{{ $t('detail.preparing') }}</text>
        </view>
        <!-- 文档操作按钮 -->
        <view v-else>
          <view class="pdf-box" @tap="openPdf">
            <text class="pdf-name">{{ $t('detail.datasheet') }}</text>
            <text class="download-text">{{ $t('detail.viewDoc') }}</text>
          </view>
          <view class="pdf-box" @tap="copyLink">
            <text class="pdf-name">{{ $t('detail.datasheet') }}</text>
            <text class="download-text">{{ $t('detail.copyLink') }}</text>
          </view>
        </view>
        <view class="pdf-box tip-box" style="font-size: 24rpx; color: #fff; margin-top: 20rpx;">
          {{ $t('detail.tip') }}
        </view>
      </view>


    </view>
    <retry-state v-if="!product && loadError" @retry="loadProductDetail" />
  </view>
</template>

<script>
import { getProductDetail, getDownloadUrl } from '@/api/index.js';
import shareMixin from '@/mixins/share.js';
import { t } from '@/utils/i18n.js';
import { getCachedPath } from '@/utils/cache.js';
import { downloadDoc, openDoc } from '@/utils/documents.js';
import RetryState from '@/components/RetryState.vue';

export default {
  mixins: [shareMixin],
  components: { RetryState },
  computed: {
    // 获取参数标题列表，兼容新旧格式
    paramTitlesList() {
      if (!this.product?.catalog?.paramTitles) return [];
      return this.product.catalog.paramTitles;
    }
  },
  data() {
    return {
      id: '',
      product: null,
      loadError: false,
      pdfDownloadUrl: '', // 存储 PDF 下载链接
      pdfTempFilePath: '', // 缓存临时文件路径
      isLoadingPdf: false, // PDF 加载状态
      isDownloadingPdf: false // PDF 下载状态
    }
  },
  onLoad(options) {
    this.id = options.id;
    this.loadProductDetail();
  },
  methods: {
    // 获取参数值，兼容新旧格式
    getParamValue(param) {
      if (!this.product?.parameters) return '-';
      // 新格式：用 id 取值
      if (typeof param === 'object' && param.id) {
        return this.product.parameters[param.id] || '-';
      }
      // 旧格式：直接用字符串作为 key
      return this.product.parameters[param] || '-';
    },
    // 获取产品详情
    async loadProductDetail() {
      this.loadError = false;
      try {
        const { data } = await getProductDetail(this.id);
        if (data.code === 0) {
          this.product = data.data;
          uni.setNavigationBarTitle({
            title: this.product.name
          });

          // 如果产品有 PDF 文件，立即获取下载链接
          if (this.product.fileID) {
            this.getPdfDownloadUrl();
          }
        } else {
          this.loadError = true;
          uni.showToast({
            title: t('detail.loadFail'),
            icon: 'none'
          });
        }
      } catch (e) {
        this.loadError = true;
      }
    },

    // 获取 PDF 下载链接
    getPdfDownloadUrl() {
      if (!this.product?.fileID || this.isLoadingPdf) return;

      this.isLoadingPdf = true;
      uni.showLoading({
        title: t('doc.preparing'),
      });

      getDownloadUrl(this.product.fileID).then(url => {
        uni.hideLoading();
        this.isLoadingPdf = false;
        this.pdfDownloadUrl = url;
      }).catch(() => {
        uni.hideLoading();
        this.isLoadingPdf = false;
        uni.showToast({
          title: t('doc.linkFail'),
          icon: 'none'
        });
      });
    },

    // 下载文件，返回本地文件路径
    async downloadPdfFile() {
      if (!this.pdfDownloadUrl) {
        // 如果尚未获取到链接，则尝试重新获取
        if (this.product?.fileID) {
          this.getPdfDownloadUrl();
          uni.showToast({
            title: t('doc.waitPreparing'),
            icon: 'none'
          });
        } else {
          uni.showToast({
            title: t('doc.notExist'),
            icon: 'none'
          });
        }
        return null;
      }

      const fileId = this.product.fileID;

      // 命中缓存直接返回
      const cachedPath = await getCachedPath(fileId);
      if (cachedPath) {
        this.pdfTempFilePath = cachedPath;
        return cachedPath;
      }
      // 缓存已失效（被清除或被淘汰），不能再沿用旧的临时路径
      this.pdfTempFilePath = '';

      if (this.isDownloadingPdf) {
        uni.showToast({
          title: t('doc.waitDownloading'),
          icon: 'none'
        });
        return null;
      }

      this.isDownloadingPdf = true;
      uni.showLoading({
        title: t('doc.downloading')
      });

      try {
        const path = await downloadDoc({
          url: this.pdfDownloadUrl,
          name: this.product.name,
          fileId
        });
        uni.hideLoading();
        this.isDownloadingPdf = false;
        this.pdfTempFilePath = path;
        return path;
      } catch (error) {
        uni.hideLoading();
        this.isDownloadingPdf = false;
        uni.showToast({
          title: t('doc.downloadFail'),
          icon: 'none'
        });
        return null;
      }
    },

    // 查看PDF
    async openPdf() {
      const filePath = await this.downloadPdfFile();
      if (!filePath) return;

      openDoc(filePath).catch(() => {
        uni.showToast({
          title: t('doc.openFail'),
          icon: 'none'
        });
      });
    },

    // 复制链接
    async copyLink() {
      // 复制链接到剪贴板
      if (this.pdfDownloadUrl) {
        uni.setClipboardData({
          data: this.pdfDownloadUrl,
          success: () => {
            uni.showToast({
              title: t('doc.linkCopied'),
              icon: 'none'
            });
          }
        });
      }
    },
  }
}
</script>

<style lang="scss">
@import '@/common/style/common.scss';

.container {
  @include page-container;
  padding: 0 0 30rpx;
  box-sizing: border-box;

  .product-detail {
    .header-card {
      @include header-card;
      margin: 0;
      background: #0e1a2d;

      .product-info {
        .product-name {
          font-size: 44rpx;
          font-weight: bold;
          margin-bottom: 20rpx;
          display: block;
          color: #FFFFFF;
          text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
        }

        .catalog-name {
          font-size: 28rpx;
          color: rgba(255, 255, 255, 0.9);
        }
      }
    }

    .section-card {
      @include card;
      margin: 30rpx 20rpx;
      overflow: hidden;

      .section-header {
        padding: 30rpx;
        border-bottom: 1px solid $border-color;

        .section-title {
          font-size: 32rpx;
          color: $text-primary;
          font-weight: 500;
        }
      }

      .params-list {
        .param-item {
          display: flex;
          padding: 24rpx 30rpx;
          border-bottom: 1px solid $border-color;
          transition: background-color 0.3s ease;

          &:last-child {
            border-bottom: none;
          }

          &:active {
            background-color: $hover-color;
          }

          .param-label {
            width: 280rpx;
            font-size: 28rpx;
            color: $text-secondary;
          }

          .param-value {
            flex: 1;
            font-size: 28rpx;
            color: $text-primary;
          }
        }
      }

      .pdf-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60rpx 0;
        
        .loading-icon {
          font-size: 48rpx;
          color: $primary-color;
          margin-bottom: 20rpx;
          animation: rotate 1.5s linear infinite;
        }
        
        .loading-text {
          font-size: 28rpx;
          color: $text-secondary;
        }
      }

      .pdf-box {
        padding: 30rpx;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background-color 0.3s ease;

        &:active {
          background-color: $hover-color;
        }

        .pdf-name {
          font-size: 28rpx;
          color: $text-primary;
        }

        .download-text {
          font-size: 28rpx;
          color: $primary-color;
          background: rgba($primary-color, 0.1);
          padding: 12rpx 40rpx;
          border-radius: 30rpx;
          border: 1px solid rgba($primary-color, 0.2);
        }
        
        &.tip-box {
          flex-direction: column;
          align-items: flex-start;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 8rpx;
          margin: 0 30rpx 30rpx;
          padding: 20rpx;
        }
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>