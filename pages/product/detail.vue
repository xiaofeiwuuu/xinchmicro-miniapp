<template>
  <view class="container">
    <view class="product-detail" v-if="product">
      <!-- 产品基本信息：左边名称和目录，右边价格（商城上架了才有；会员价生效时有金边标签和划线的普通价，下面是库存/起订量） -->
      <view class="header-card">
        <view class="header-row">
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <text class="catalog-name" v-if="product.catalog">{{ product.catalog.name }}</text>
          </view>
          <view v-if="sale" class="header-price">
            <text class="price-big">{{ $t('shop.price', { price: sale.price.toFixed(2) }) }}</text>
            <view v-if="sale.listPrice" class="price-sub">
              <text class="price-member">{{ $t('shop.memberPrice') }}</text>
              <text class="price-list">{{ $t('shop.price', { price: sale.listPrice.toFixed(2) }) }}</text>
            </view>
            <text v-if="saleHint" class="price-hint">{{ saleHint }}</text>
          </view>
        </view>
        <!-- 阶梯价：买得越多单价越低，一行小标签 -->
        <view v-if="sale && tierRows.length" class="tier-strip">
          <view v-for="s in tierRows" :key="s.minQty" class="tier-chip" :class="{ last: s.last }">
            <text v-if="s.last" class="tier-badge">{{ $t('buy.lowest') }}</text>
            <text class="tier-q">{{ s.label }}</text>
            <text class="tier-p">{{ $t('shop.price', { price: s.price.toFixed(2) }) }}</text>
          </view>
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
    <!-- 后台把这个产品所在的分类或目录隐藏了（或产品被删了）：服务端返回 404 -->
    <empty-state v-if="!product && gone" :text="$t('detail.gone')" />

    <!-- 给底部固定的购买栏留位置，免得最后的内容被盖住 -->
    <view v-if="product && sale" class="buy-space"></view>
    <!-- 购买栏一行：购物车（带角标）+ 加入购物车 + 立即购买；数量在点按钮后弹出的面板里选 -->
    <view v-if="product && sale" class="buy-bar">
      <view class="buy-cart" @tap="goCart">
        <image src="/static/icon/shop.png" class="buy-cart-icon" mode="aspectFit"></image>
        <text v-if="cartCount > 0" class="buy-badge">{{ cartCount > 99 ? '99+' : cartCount }}</text>
        <text class="buy-cart-text">{{ $t('buy.cart') }}</text>
      </view>
      <view class="buy-btn ghost" :class="{ disabled: !canBuyNow }" @tap="openSheet('cart')"><text>{{ $t('buy.addCart') }}</text></view>
      <view class="buy-btn main" :class="{ disabled: !canBuyNow }" @tap="openSheet('buy')"><text>{{ $t('detail.buy') }}</text></view>
    </view>
    <buy-sheet v-if="product && sale" :visible="sheetVisible" :mode="sheetMode" :item="sale" :hint="saleHint" @close="sheetVisible = false" @buy="onSheetBuy" />
  </view>
</template>

<script>
import { getProductDetail, getDownloadUrl } from '@/api/index.js';
import { getProductSale } from '@/api/shop.js';
import { cartState, canBuy, tierSteps } from '@/utils/cart.js';
import { setCheckout } from '@/utils/checkout.js';
import { safeNavigate } from '@/utils/nav.js';
import BuySheet from '@/pages/product/components/BuySheet.vue';
import { resolveProductDoc } from '@/utils/productDoc.js';
import shareMixin from '@/mixins/share.js';
import { t } from '@/utils/i18n.js';
import { getCachedPath } from '@/utils/cache.js';
import { downloadDoc, openDoc } from '@/utils/documents.js';
import RetryState from '@/components/RetryState.vue';
import EmptyState from '@/components/EmptyState.vue';

// 下载链接有效期 1 小时，提前 10 分钟视为过期
const URL_TTL = 50 * 60 * 1000;

export default {
  mixins: [shareMixin],
  components: { RetryState, EmptyState, BuySheet },
  computed: {
    // 获取参数标题列表，兼容新旧格式
    // 购物车里一共几件（购买栏上的角标）
    cartCount() {
      return Object.keys(cartState.items).reduce((n, id) => n + cartState.items[id], 0);
    },
    // 阶梯价的几档（没有阶梯价是空数组）；第一档是起步价
    tierRows() {
      return this.sale ? tierSteps(this.sale) : [];
    },
    canBuyNow() {
      return !!this.sale && canBuy(this.sale);
    },
    // 价格下面的一行小字：库存、起订量
    saleHint() {
      const s = this.sale;
      if (!s) return '';
      if (s.stock <= 0) return t('shop.soldOut');
      if (!canBuy(s)) return t('shop.belowMin');
      // 不限库存的不显示库存数（服务端给的 stock 是一个很大的占位数），只显示起订量
      // 起订量、每单限购、库存：有的才显示，用 · 隔开
      const parts = [];
      if (!s.stockUnlimited) parts.push(t('shop.stock', { n: s.stock }));
      if (s.minOrderQty > 1) parts.push(t('shop.minQty', { n: s.minOrderQty }));
      if (s.maxOrderQty > 0) parts.push(t('shop.maxQtyTag', { n: s.maxOrderQty }));
      return parts.join(' · ');
    },
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
      loadError: false,
      gone: false,
      sheetVisible: false,
      sheetMode: 'cart',
      sale: null // 商城销售信息：{ id, name, price, stock, minOrderQty }，没上架就是 null（不显示购买栏）
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
    // 商城销售信息：失败（没上架、没定价、没网）就当没有，不影响看参数和数据手册
    async loadSale() {
      try {
        const { data } = await getProductSale(this.id);
        this.sale = data && data.code === 0 ? data.data : null;
      } catch (e) {
        this.sale = null;
      }
    },
    goCart() {
      safeNavigate('/pages/cart/index');
    },
    // 打开选数量的面板：cart = 加入购物车，buy = 立即购买
    openSheet(mode) {
      if (!this.canBuyNow) return;
      this.sheetMode = mode;
      this.sheetVisible = true;
    },
    // 立即购买：只买这一个产品，数量是面板里选的；购物车里别的商品不受影响
    onSheetBuy(qty) {
      setCheckout([{ item: this.sale, qty }]);
      safeNavigate('/pages/order/confirm');
    },
    // 获取产品详情
    async loadProductDetail() {
      this.loadError = false;
      this.gone = false;
      try {
        const res = await getProductDetail(this.id);
        const data = res.data;
        if (res.statusCode === 404) {
          this.gone = true;
        } else if (data.code === 0) {
          this.product = data.data;
          this.loadSale();
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

.buy-space {
  height: calc(200rpx + constant(safe-area-inset-bottom));
  height: calc(200rpx + env(safe-area-inset-bottom));
}
.buy-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  padding-bottom: calc(44rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(44rpx + env(safe-area-inset-bottom));
  background: #122642;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .buy-cart {
    position: relative;
    width: 96rpx;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .buy-cart-icon {
    width: 44rpx;
    height: 44rpx;
  }
  .buy-cart-text {
    margin-top: 4rpx;
    color: rgba(255, 255, 255, 0.7);
    font-size: 20rpx;
  }
  .buy-badge {
    position: absolute;
    top: -8rpx;
    right: 14rpx;
    min-width: 32rpx;
    height: 32rpx;
    padding: 0 8rpx;
    box-sizing: border-box;
    border-radius: 16rpx;
    background: #ff4d4f;
    color: #fff;
    font-size: 20rpx;
    line-height: 32rpx;
    text-align: center;
  }
  .buy-btn {
    flex: 1;
    height: 96rpx;
    margin-left: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 48rpx;
    font-size: 28rpx;
    font-weight: 700;
    white-space: nowrap;

    &.ghost {
      border: 1px solid #00a8ff;
      color: #00a8ff;
    }
    &.main {
      background: linear-gradient(135deg, #00a8ff, #0072ff);
      color: #fff;
    }
    &.disabled {
      opacity: 0.4;
    }
  }
}
// 头部：名称在左，价格在右
.header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.header-row .product-info {
  flex: 1;
  min-width: 0;
  margin-right: 24rpx;
}
.header-price {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: 55%;

  .price-big {
    color: #ffb74d;
    font-size: 48rpx;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
  }
  .price-sub {
    display: flex;
    align-items: center;
    margin-top: 10rpx;
  }
  .price-member {
    height: 42rpx;
    box-sizing: border-box;
    padding: 0 14rpx;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    font-size: 26rpx;
    color: #ffd54f;
    border: 1rpx solid rgba(255, 213, 79, 0.6);
    border-radius: 8rpx;
    white-space: nowrap;
  }
  .price-list {
    margin-left: 12rpx;
    color: rgba(255, 255, 255, 0.45);
    font-size: 28rpx;
    line-height: 1;
    text-decoration: line-through;
    white-space: nowrap;
  }
  .price-hint {
    margin-top: 10rpx;
    color: rgba(255, 255, 255, 0.6);
    font-size: 26rpx;
    text-align: right;
  }
}
// 阶梯价小标签（头部卡片里，名称和价格的下面）
.tier-strip {
  display: flex;
  flex-wrap: wrap;
  margin: 20rpx -8rpx 0;
  padding-bottom: 12rpx; // 最低价角标挂在最后一个小块的下沿外面，留点位置
}
// 每行 3 个、宽度完全一样（以前按文字长短撑开，「40件及以上」比别的宽一截）
.tier-chip {
  position: relative;
  box-sizing: border-box;
  flex: 0 0 calc(33.333% - 16rpx);
  width: calc(33.333% - 16rpx);
  margin: 8rpx;
  padding: 14rpx 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1rpx solid rgba(255, 183, 77, 0.5);
  border-radius: 14rpx;
}
.tier-chip.last {
  border-color: rgba(255, 183, 77, 0.85);
}
// 最后一档（最低价）右下角的小角标，和前一档一眼区分
.tier-badge {
  position: absolute;
  bottom: -16rpx;
  right: -6rpx;
  height: 34rpx;
  padding: 0 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: 22rpx;
  color: #1a1a1a;
  background: #ffb74d;
  border-radius: 8rpx;
}
.tier-q {
  color: rgba(255, 255, 255, 0.7);
  font-size: 26rpx;
  line-height: 1.3;
  text-align: center;
}
.tier-p {
  color: #ffb74d;
  text-align: center;
  font-size: 38rpx;
  font-weight: 600;
  line-height: 1.3;
  margin-top: 4rpx;
}

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