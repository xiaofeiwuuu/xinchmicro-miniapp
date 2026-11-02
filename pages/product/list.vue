<template>
  <view class="container">
    <zb-table
      :fit="true"
      :columns="columns"
      :data="products"
      :loading="loading"
      :empty-text="$t('common.noProduct')"
      :border="true"
      :stripe="true"
      :show-header="true"
      @row-click="navigateToDetail"
    >
      <template #empty>
        <view class="empty-state">
          <text class="iconfont icon-empty"></text>
          <text>{{ $t('common.noProduct') }}</text>
        </view>
      </template>
    </zb-table>
    <retry-state v-if="loadError && products.length === 0" @retry="loadProducts" />
  </view>
</template>

<script>
import { getProducts, getDownloadUrl } from '@/api/index.js';
import shareMixin from '@/mixins/share.js';
import { t } from '@/utils/i18n.js';
import { getCachedPath } from '@/utils/cache.js';
import { downloadDoc, openDoc } from '@/utils/documents.js';
import { buildColumns } from '@/utils/productFilter.js';
import RetryState from '@/components/RetryState.vue';

export default {
  mixins: [shareMixin],
  components: { RetryState },
  data() {
    return {
      products: [],
      loading: false,
      loadError: false,
      catalogId: '',
      hasMore: true,
      columns: [],
      isLoadingPdf: false,
      pdfDownloadUrl: '',
      isDownloadingPdf: false
    }
  },
  onLoad(options) {
    this.catalogId = options.catalogId || options.id;
    this.loadProducts();
  },
  methods: {
    async loadProducts() {
      if (this.loading || !this.hasMore) return;

      this.loading = true;
      this.loadError = false;
      try {
        const { data } = await getProducts({
          catalogId: this.catalogId,
        });

        if (data.code === 0) {
          // 兼容 data.data.list 和 data.data 两种格式
          const newProducts = Array.isArray(data.data?.list) ? data.data.list : (Array.isArray(data.data) ? data.data : []);

          this.products = [...this.products, ...newProducts.map(item => ({...item, ...item.parameters}))];
          this.hasMore = newProducts.length > 0;
          // 用目录的参数标题生成表格列（第一列固定）
          if (newProducts.length > 0) {
            this.columns = buildColumns(newProducts[0].catalog?.paramTitles, true);
          }
        } else {
          this.loadError = true;
        }
      } catch (e) {
        this.loadError = true;
      } finally {
        this.loading = false;
      }
    },

    // 点击一行：获取下载链接后下载并打开该产品的 PDF
    navigateToDetail(row) {
      this.getPdfDownloadUrl(row)
    },

    // 获取 PDF 下载链接
    getPdfDownloadUrl(product) {
      if (!product?.fileID || this.isLoadingPdf) return;

      this.isLoadingPdf = true;
      uni.showLoading({
        title: t('doc.preparing'),
        mask: true
      });

      getDownloadUrl(product.fileID).then(url => {
        uni.hideLoading();
        this.isLoadingPdf = false;
        this.pdfDownloadUrl = url;
        this.downloadPdfFile(product);
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
    async downloadPdfFile(product) {
      if (!this.pdfDownloadUrl) {
        // 如果尚未获取到链接，则尝试重新获取
        if (product?.fileID) {
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

      const fileId = product.fileID;

      // 命中缓存直接打开
      const cachedPath = await getCachedPath(fileId);
      if (cachedPath) {
        uni.showToast({
          title: t('doc.opening'),
          icon: 'none',
          duration: 500
        });
        setTimeout(() => {
          this.openPdf(cachedPath);
        }, 100);
        return cachedPath;
      }

      if (this.isDownloadingPdf) {
        uni.showToast({
          title: t('doc.waitDownloading'),
          icon: 'none'
        });
        return null;
      }

      this.isDownloadingPdf = true;
      uni.showLoading({
        title: t('doc.downloading'),
        mask: true
      });

      try {
        const path = await downloadDoc({
          url: this.pdfDownloadUrl,
          name: product.name,
          fileId
        });
        uni.hideLoading();
        this.isDownloadingPdf = false;
        this.openPdf(path);
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
    openPdf(filePath) {
      if (typeof(filePath) !== 'string') return;

      openDoc(filePath).catch(() => {
        uni.showToast({
          title: t('doc.openFail'),
          icon: 'none'
        });
      });
    },
  }
}
</script>

<style lang="scss">
@import '@/common/style/common.scss';

.container {
  @include page-container;
  padding: 0;
  height: 90vh;
  :deep(.zb-table) {
    background: $card-background;
    
    .zb-table-header {
      background: darken($card-background, 3%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      
      .zb-table-cell {
        color: $text-secondary;
        font-weight: 500;
        background: darken($card-background, 3%);
        
        &.fixed-left {
          &::after {
            content: '';
            position: absolute;
            right: 0;
            top: 20%;
            height: 60%;
            width: 1px;
            background: rgba(255, 255, 255, 0.05);
          }
        }
      }
    }
    
    .zb-table-row {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      transition: background-color 0.3s ease;
      
      &:active {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .zb-table-cell {
        color: $text-primary;
        background: $card-background;
        
        &.fixed-left {
          &::after {
            content: '';
            position: absolute;
            right: 0;
            top: 20%;
            height: 60%;
            width: 1px;
            background: rgba(255, 255, 255, 0.05);
          }
        }
      }
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 100rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .iconfont {
      font-size: 80rpx;
      color: rgba(255, 255, 255, 0.2);
      margin-bottom: 20rpx;
    }
    
    text {
      font-size: 28rpx;
      color: $text-light;
      
      &:not(.iconfont) {
        margin-top: 10rpx;
      }
    }
  }
  
  .load-more {
    text-align: center;
    padding: 30rpx;
    color: $text-light;
    font-size: 28rpx;
    
    &:active {
      opacity: 0.7;
    }
  }
}
</style> 