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
          <view class="param-item" v-for="row in paramRows" :key="row.key">
            <text class="param-label">{{ row.title }}</text>
            <text class="param-value">{{ row.value }}</text>
          </view>
        </view>
      </view>

      <!-- PDF文档 -->
      <view class="section-card" v-if="product.pdfUrl || product.pdfUrlEn">
        <view class="section-header">
          <text class="section-title">{{ $t('detail.techDocs') }}</text>
        </view>
        <!-- 文档操作按钮 -->
        <view>
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
import { resolveProductDoc } from '@/utils/productDoc.js';
import shareMixin from '@/mixins/share.js';
import { t } from '@/utils/i18n.js';
import { getCachedPath } from '@/utils/cache.js';
import { downloadDoc, openDoc } from '@/utils/documents.js';
import RetryState from '@/components/RetryState.vue';

// 下载链接有效期 1 小时，提前 10 分钟视为过期
const URL_TTL = 50 * 60 * 1000;

export default {
  mixins: [shareMixin],
  components: { RetryState },
  computed: {
    // 获取参数标题列表，兼容新旧格式
    paramTitlesList() {
      if (!this.product?.catalog?.paramTitles) return [];
      return this.product.catalog.paramTitles;
    },
    // 模板里直接用的行：key、标题、值都在这里算好。
    // （小程序编译不支持 :key 里写表达式，比如 param.id || param，所以不能在模板里现算）
    paramRows() {
      return this.paramTitlesList.map((param, i) => {
        const isObj = param && typeof param === 'object';
        return { key: (isObj && param.id) || String(param) + '-' + i, title: (isObj && param.title) || param, value: this.getParamValue(param) };
      });
    }
  },
  data() {
    return {
      id: '',
      product: null,
      loadError: false
    }
  },
  created() {
    this.busy = false; // 正在取链接/下载文档期间忽略再次点击；不需要响应式
    this.pdfDownloadUrl = ''; // 最近一次取到的下载链接
    this.pdfUrlTime = 0; // 取链接的时间
    this.pdfUrlFileId = ''; // 这个链接对应的文件（中英文版是不同的文件）
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

    // 链接是否还在有效期内
    hasFreshUrl(fileId) {
      return !!this.pdfDownloadUrl && this.pdfUrlFileId === fileId && Date.now() - this.pdfUrlTime < URL_TTL;
    },

    // 取下载链接：有效期内复用，过期或 force 时重新获取
    async ensureDownloadUrl(fileId, force = false) {
      if (!force && this.hasFreshUrl(fileId)) return this.pdfDownloadUrl;
      const url = await getDownloadUrl(fileId);
      this.pdfDownloadUrl = url;
      this.pdfUrlTime = Date.now();
      this.pdfUrlFileId = fileId;
      return url;
    },

    // 取链接并下载，返回本地路径；失败时已提示并返回 null
    async fetchPdf(fileId) {
      const reused = this.hasFreshUrl(fileId);

      uni.showLoading({ title: t('doc.preparing'), mask: true });
      let url;
      try {
        url = await this.ensureDownloadUrl(fileId);
      } catch (e) {
        uni.hideLoading();
        uni.showToast({ title: t('doc.linkFail'), icon: 'none' });
        return null;
      }

      uni.showLoading({ title: t('doc.downloading'), mask: true });
      const name = this.product.name;
      try {
        return await downloadDoc({ url, name, fileId });
      } catch (e) {
        // 复用的旧链接可能已失效，换新链接再试一次
        if (reused) {
          try {
            return await downloadDoc({ url: await this.ensureDownloadUrl(fileId, true), name, fileId });
          } catch (e2) {}
        }
        uni.showToast({ title: t('doc.downloadFail'), icon: 'none' });
        return null;
      } finally {
        uni.hideLoading();
      }
    },

    // 查看PDF：本地已有就直接打开（不需要网络），否则取链接、下载后打开
    async openPdf() {
      if (this.busy) return;
      // 没有文档会提示；英文界面缺英文版时先问用户是否改开中文版
      const fileId = await resolveProductDoc(this.product, 'open');
      if (!fileId || this.busy) return;
      this.busy = true;
      try {
        const path = (await getCachedPath(fileId)) || (await this.fetchPdf(fileId));
        if (!path) return;
        openDoc(path).catch(() => {
          uni.showToast({ title: t('doc.openFail'), icon: 'none' });
        });
      } finally {
        this.busy = false;
      }
    },

    // 复制链接
    async copyLink() {
      if (this.busy) return;
      const fileId = await resolveProductDoc(this.product, 'copy');
      if (!fileId || this.busy) return;
      this.busy = true;
      uni.showLoading({ title: t('doc.preparing'), mask: true });
      try {
        const url = await this.ensureDownloadUrl(fileId);
        uni.hideLoading();
        uni.setClipboardData({
          data: url,
          success: () => {
            uni.showToast({ title: t('doc.linkCopied'), icon: 'none' });
          }
        });
      } catch (e) {
        uni.hideLoading();
        uni.showToast({ title: t('doc.linkFail'), icon: 'none' });
      } finally {
        this.busy = false;
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