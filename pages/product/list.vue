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
        <empty-state :text="$t('common.noProduct')" />
      </template>
    </zb-table>
    <retry-state v-if="loadError && products.length === 0" @retry="loadProducts" />
  </view>
</template>

<script>
import { getProducts, getDownloadUrl } from '@/api/index.js';
import shareMixin from '@/mixins/share.js';
import { t } from '@/utils/i18n.js';
import { decodeParam } from '@/utils/nav.js';
import { getCachedPath } from '@/utils/cache.js';
import { downloadDoc, openDoc } from '@/utils/documents.js';
import { buildColumns } from '@/utils/productFilter.js';
import RetryState from '@/components/RetryState.vue';
import EmptyState from '@/components/EmptyState.vue';

export default {
  mixins: [shareMixin],
  components: { RetryState, EmptyState },
  data() {
    return {
      products: [],
      loading: false,
      loadError: false,
      catalogId: '',
      catalogName: '',
      hasMore: true,
      columns: []
    }
  },
  created() {
    // 正在取链接/下载文档（点击后到打开前），期间忽略再次点击；不需要响应式
    this.busy = false;
  },
  onLoad(options) {
    this.catalogId = options.catalogId || options.id;
    this.catalogName = decodeParam(options.catalogName) || '';
    // 标题用目录名；旧链接没有目录名时用通用标题
    uni.setNavigationBarTitle({ title: this.catalogName || t('nav.list') });
    // 缺少目录参数时不请求（不带 catalogId 会拉取全部产品）
    if (this.catalogId) this.loadProducts();
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

    // 点击一行：打开该产品的 PDF
    navigateToDetail(row) {
      this.openProductPdf(row);
    },

    // 打开产品 PDF：本地已有就直接打开（不需要网络），否则取链接、下载后打开
    async openProductPdf(product) {
      if (this.busy) return;
      if (!product || !product.fileID) {
        uni.showToast({ title: t('doc.notExist'), icon: 'none' });
        return;
      }
      this.busy = true;
      try {
        const fileId = product.fileID;
        const cachedPath = await getCachedPath(fileId);
        if (cachedPath) {
          uni.showToast({ title: t('doc.opening'), icon: 'none', duration: 500 });
          setTimeout(() => this.openPdf(cachedPath), 100);
          return;
        }

        uni.showLoading({ title: t('doc.preparing'), mask: true });
        let url;
        try {
          url = await getDownloadUrl(fileId);
        } catch (e) {
          uni.hideLoading();
          uni.showToast({ title: t('doc.linkFail'), icon: 'none' });
          return;
        }

        uni.showLoading({ title: t('doc.downloading'), mask: true });
        try {
          const path = await downloadDoc({ url, name: product.name, fileId });
          uni.hideLoading();
          this.openPdf(path);
        } catch (e) {
          uni.hideLoading();
          uni.showToast({ title: t('doc.downloadFail'), icon: 'none' });
        }
      } finally {
        this.busy = false;
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