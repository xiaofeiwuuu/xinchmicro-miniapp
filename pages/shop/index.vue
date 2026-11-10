<template>
  <view class="shop-page">
    <!-- 搜索框：输入时在所有在售商品里找，结果是一个平铺列表；清空后回到分类视图 -->
    <view class="search-bar">
      <input v-model="keyword" class="search-input" :placeholder="$t('shop.search')" confirm-type="search" />
      <view v-if="keyword" class="search-clear" @tap="keyword = ''">
        <image src="/static/icon/clear.png" class="search-clear-icon" mode="aspectFit"></image>
      </view>
    </view>

    <RetryState v-if="failed" @retry="load" />
    <!-- 第一次取商品的时候：骨架屏（以前是一片空白） -->
    <ShopSkeleton v-else-if="!loaded" />
    <EmptyState v-else-if="!categories.length" image="/static/empty/no-goods.png" :text="$t('shop.empty')" :hint="$t('shop.emptyHint')" />

    <!-- 搜索结果 -->
    <scroll-view v-else-if="keyword.trim()" scroll-y class="result">
      <EmptyState v-if="!results.length" image="/static/empty/no-result.png" :text="$t('shop.noResult')" :hint="$t('shop.noResultHint')" />
      <product-card v-for="item in results" :key="item.id" :item="item" :tag="L(item.catalog)" @open="openDetail" />
      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 左边分类、右边按目录分段的商品 -->
    <view v-else-if="loaded" class="body">
      <scroll-view scroll-y class="left">
        <view
          v-for="cat in categories"
          :key="cat.id"
          class="cat"
          :class="{ active: cat.id === activeId }"
          @tap="selectCat(cat)"
        >
          <text>{{ L(cat) }}</text>
        </view>
        <view class="bottom-space"></view>
      </scroll-view>

      <scroll-view scroll-y class="right" :scroll-top="rightTop" @scroll="onRightScroll">
        <view v-for="(catalog, index) in activeCategory.catalogs" :key="catalog.id" class="section">
          <!-- 目录标题：点击展开/收起这个目录下的产品 -->
          <view class="section-head" @tap="toggleCatalog(catalog, index)">
            <text class="section-title">{{ L(catalog) }}</text>
            <text class="section-count">{{ catalog.products.length }}</text>
            <text class="section-arrow" :class="{ open: isOpen(catalog, index) }">›</text>
          </view>
          <view v-if="isOpen(catalog, index)">
            <product-card v-for="item in catalog.products" :key="item.id" :item="item" @open="openDetail" />
          </view>
        </view>
        <view class="bottom-space"></view>
      </scroll-view>
    </view>

    <cart-bar :products="allProducts" @checkout="checkout" />
  </view>
</template>

<script>
import { getShopCatalog } from '@/api/shop.js';
import { getLang } from '@/utils/i18n.js';
import { logError } from '@/utils/logger.js';
import RetryState from '@/components/RetryState.vue';
import EmptyState from '@/components/EmptyState.vue';
import ShopSkeleton from '@/pages/shop/components/ShopSkeleton.vue';
import ProductCard from '@/pages/shop/components/ProductCard.vue';
import CartBar from '@/pages/shop/components/CartBar.vue';
import { setCheckout } from '@/utils/checkout.js';
import { reconcileCart } from '@/utils/cart.js';
import { safeNavigate } from '@/utils/nav.js';

export default {
  components: { RetryState, EmptyState, ShopSkeleton, ProductCard, CartBar },
  data() {
    return { categories: [], activeId: null, keyword: '', loaded: false, failed: false, rightTop: 0, expanded: {} };
  },
  computed: {
    lang() {
      return getLang();
    },
    activeCategory() {
      return this.categories.find((c) => c.id === this.activeId) || this.categories[0] || { catalogs: [] };
    },
    // 所有商品平铺（购物车栏按 id 查价格用）
    allProducts() {
      const out = [];
      this.categories.forEach((cat) => cat.catalogs.forEach((catalog) => out.push(...catalog.products)));
      return out;
    },
    // 搜索：名称（中英文），不区分大小写。数据在本地，不请求服务端
    // （接真实接口后商品多了，改成服务端搜索并加防抖）
    results() {
      const kw = this.keyword.trim().toLowerCase();
      if (!kw) return [];
      const out = [];
      this.categories.forEach((cat) =>
        cat.catalogs.forEach((catalog) =>
          catalog.products.forEach((p) => {
            const text = [p.name, p.nameEn].join(' ').toLowerCase();
            if (text.includes(kw)) out.push({ ...p, catalog });
          })
        )
      );
      return out;
    }
  },
  onLoad() {
    this.lastTop = 0; // 不用响应式：只是记住右边的滚动位置
    this.loadedLang = getLang();
    this.load();
  },
  onShow() {
    // 在首页切换了语言再回来：名称是服务端按语言返回的，要重新取
    if (this.loadedLang && this.loadedLang !== getLang()) {
      this.loadedLang = getLang();
      this.load();
    }
  },
  methods: {
    // 当前语言下的名称，缺英文回退中文
    // 服务端已按语言取好名称（英文缺失时回退中文），直接用 name
    L(o) {
      return o.name;
    },
    // 目录是否展开：用户点过就按用户的；没点过，每个分类下只默认展开第一个目录
    isOpen(catalog, index) {
      const v = this.expanded[catalog.id];
      return v === undefined ? index === 0 : v;
    },
    toggleCatalog(catalog, index) {
      this.$set(this.expanded, catalog.id, !this.isOpen(catalog, index));
    },
    // 切换分类：右边回到顶部。scroll-top 只有「值变化」才生效，所以先设成当前位置再改回 0
    selectCat(cat) {
      if (cat.id === this.activeId) return;
      this.activeId = cat.id;
      this.rightTop = this.lastTop;
      this.$nextTick(() => {
        this.rightTop = 0;
      });
    },
    onRightScroll(e) {
      this.lastTop = e.detail.scrollTop;
    },
    async load() {
      this.failed = false;
      const lang = getLang();
      try {
        const { data } = await getShopCatalog();
        if (lang !== getLang()) return; // 请求期间又切换了语言，丢弃旧语言的结果
        if (data.code !== 0) throw new Error(data.message || 'load failed');
        this.categories = data.data || [];
        if (!this.categories.some((c) => c.id === this.activeId)) {
          this.activeId = this.categories.length ? this.categories[0].id : null;
        }
        this.loaded = true;
        // 购物车存在本机：对着最新的商品把下架、库存不够、不到起订量的处理掉（取失败时不会走到这里，不会误清空）
        const fixed = reconcileCart(this.allProducts);
        if (fixed.removed || fixed.adjusted) uni.showToast({ title: this.$t('shop.cartUpdated'), icon: 'none' });
      } catch (e) {
        logError('shop.load', { error: (e && (e.errMsg || e.message)) || String(e) });
        if (!this.loaded) this.failed = true;
      }
    },
    // selected：勾选的商品行 [{ item, qty }]，交给确认订单页
    checkout(selected) {
      setCheckout(selected);
      safeNavigate('/pages/order/confirm');
    },
    // 点商品卡片：进商品详情页（参数、数据手册、购买）
    openDetail(item) {
      safeNavigate('/pages/product/detail?id=' + item.id);
    }
  }
};
</script>

<style lang="scss">
.shop-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0e1a2d;
  box-sizing: border-box;
}

.search-bar {
  position: relative;
  padding: 20rpx 24rpx;
}
.search-input {
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 72rpx 0 28rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 36rpx;
  color: #fff;
  font-size: 28rpx;
}
.search-clear {
  position: absolute;
  right: 24rpx;
  top: 20rpx;
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-clear-icon {
  width: 32rpx;
  height: 32rpx;
}

.body {
  flex: 1;
  min-height: 0;
  display: flex;
}
.left {
  width: 200rpx;
  height: 100%;
  background: rgba(255, 255, 255, 0.04);
}
.cat {
  padding: 36rpx 16rpx;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 28rpx;
  border-left: 6rpx solid transparent;

  &.active {
    color: #fff;
    font-weight: 700;
    background: #0e1a2d;
    border-left-color: #00a8ff;
  }
}
.right {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0 20rpx;
  box-sizing: border-box;
}
.result {
  flex: 1;
  min-height: 0;
  padding: 0 24rpx;
  box-sizing: border-box;
}

// 列表底部留白：最后一个商品不会贴着屏幕底边（含 iPhone 底部横条），也给之后的购物车栏留位置
.bottom-space {
  height: calc(224rpx + constant(safe-area-inset-bottom));
  height: calc(224rpx + env(safe-area-inset-bottom));
}

.section-head {
  display: flex;
  align-items: center;
  padding: 28rpx 4rpx 20rpx;
}
.section-title {
  flex: 1;
  min-width: 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 34rpx;
  font-weight: 600;
}
.section-count {
  color: rgba(255, 255, 255, 0.5);
  font-size: 28rpx;
  margin-left: 12rpx;
}
.section-arrow {
  color: rgba(255, 255, 255, 0.6);
  font-size: 44rpx;
  line-height: 1;
  margin-left: 16rpx;
  transition: transform 0.2s ease;

  // 收起时朝右 ›，展开时朝下
  &.open {
    transform: rotate(90deg);
  }
}
</style>
