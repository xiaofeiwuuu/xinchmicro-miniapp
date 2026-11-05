<template>
  <view class="mine-page">
    <!-- 头像 + 昵称：整行可点，进入个人资料；最右边是编辑图标。登录失败时点这一行是重试登录 -->
    <view class="header" @tap="onHeader">
      <view class="avatar">
        <image v-if="avatar" :src="avatar" class="avatar-img" mode="aspectFill"></image>
        <text v-else class="avatar-text">{{ initial }}</text>
      </view>
      <view class="who">
        <text class="nickname">{{ nickname }}</text>
        <text v-if="state.status === 'fail'" class="hint">{{ $t('mine.loginFail') }}</text>
        <text v-else-if="phone" class="phone">{{ phone }}</text>
      </view>
      <image src="/static/icon/edit.png" class="edit-icon" mode="aspectFit"></image>
    </view>

    <!-- 收货地址 | 开票信息 -->
    <view class="two">
      <view class="two-card" @tap="go('/pages/address/list')">
        <image src="/static/icon/address.png" class="two-icon" mode="aspectFit"></image>
        <view class="two-text">
          <text class="two-title">{{ $t('mine.addresses') }}</text>
          <text class="two-sub">{{ $t('mine.addressesSub') }}</text>
        </view>
      </view>
      <view class="two-card" @tap="go('/pages/invoice/list')">
        <image src="/static/icon/doc.png" class="two-icon" mode="aspectFit"></image>
        <view class="two-text">
          <text class="two-title">{{ $t('mine.invoiceInfo') }}</text>
          <text class="two-sub" :class="{ warn: !hasInvoiceInfo }">{{ hasInvoiceInfo ? $t('mine.invoiceSet') : $t('mine.invoiceUnset') }}</text>
        </view>
      </view>
    </view>

    <!-- 我的订单：待付款 / 待发货 / 待收货 -->
    <view class="block">
      <view class="block-head" @tap="go('/pages/order/list')">
        <text class="block-title">{{ $t('mine.orders') }}</text>
        <text class="block-more">{{ $t('mine.allOrders') }} ›</text>
      </view>
      <view class="grid">
        <view v-for="g in orderGrid" :key="g.key" class="cell" @tap="go(g.url)">
          <view class="cell-icon">
            <image :src="g.icon" class="cell-img" mode="aspectFit"></image>
            <text v-if="g.count > 0" class="badge">{{ g.count > 99 ? '99+' : g.count }}</text>
          </view>
          <text class="cell-text">{{ g.text }}</text>
        </view>
      </view>
    </view>

    <!-- 我的发票：已开票 / 未开票 / 开票中 -->
    <view class="block">
      <view class="block-head">
        <text class="block-title">{{ $t('mine.myInvoices') }}</text>
      </view>
      <view class="grid">
        <view v-for="g in invoiceGrid" :key="g.key" class="cell" @tap="go('/pages/order/list?invoice=' + g.key)">
          <view class="cell-icon">
            <image :src="g.icon" class="cell-img" mode="aspectFit"></image>
            <text v-if="g.count > 0" class="badge">{{ g.count > 99 ? '99+' : g.count }}</text>
          </view>
          <text class="cell-text">{{ g.text }}</text>
        </view>
      </view>
    </view>

    <!-- 设置：语言、清除缓存（原来在公司页） -->
    <view class="block settings">
      <view class="row" @tap="go('/pages/announcement/list')">
        <image src="/static/icon/doc.png" class="row-icon" mode="aspectFit"></image>
        <text class="row-label">{{ $t('ann.entry') }}</text>
        <text class="row-arrow">›</text>
      </view>
      <!-- 联系客服：微信的客服会话。button 做成和其它行一样的样子 -->
      <button class="row row-btn" open-type="contact">
        <image src="/static/icon/phone.png" class="row-icon" mode="aspectFit"></image>
        <text class="row-label">{{ $t('contact.entry') }}</text>
        <text class="row-arrow">›</text>
      </button>
      <view class="row" @tap="showLangPopup = true">
        <image src="/static/icon/language.png" class="row-icon" mode="aspectFit"></image>
        <text class="row-label">{{ $t('about.language') }}</text>
        <text class="row-value">{{ langLabel }}</text>
        <text class="row-arrow">›</text>
      </view>
      <view class="row" @tap="handleClearCache">
        <image src="/static/icon/clear.png" class="row-icon" mode="aspectFit"></image>
        <text class="row-label">{{ $t('about.clearCache') }}</text>
        <text class="row-value">{{ cacheSize }}</text>
        <text class="row-arrow">›</text>
      </view>
    </view>

    <popup-selector
      :show="showLangPopup"
      :title="$t('about.language')"
      :list="langList"
      :selectedId="lang"
      @close="showLangPopup = false"
      @select="handleSelectLang"
    />
  </view>
</template>

<script>
import { customerState, ensureLogin } from '@/utils/customer.js';
import { safeNavigate } from '@/utils/nav.js';
import { getOrderSummary, getInvoiceTitles } from '@/api/shop.js';
import { getCompanyInfo } from '@/api/index.js';
import PopupSelector from '@/components/PopupSelector.vue';
import { getLang, setLang } from '@/utils/i18n.js';
import { clearAllCache, getFileCacheInfo, formatSize, writeData } from '@/utils/cache.js';
import { logError } from '@/utils/logger.js';

export default {
  components: { PopupSelector },
  data() {
    return {
      state: customerState,
      summary: {}, // 各状态的订单数，服务端数好返回
      hasInvoiceInfo: false,
      cacheSize: '0 B',
      showLangPopup: false,
      // 语言名用各自的母语写法，不随界面语言变化
      langList: [
        { id: 'zh', name: '中文' },
        { id: 'en', name: 'English' }
      ]
    };
  },
  computed: {
    lang() {
      return getLang();
    },
    langLabel() {
      const item = this.langList.find((l) => l.id === this.lang);
      return item ? item.name : '';
    },
    nickname() {
      const c = this.state.customer;
      return (c && c.nickname) || this.$t('mine.guest');
    },
    avatar() {
      return (this.state.customer && this.state.customer.avatar) || '';
    },
    phone() {
      return (this.state.customer && this.state.customer.phone) || '';
    },
    initial() {
      return this.nickname.slice(0, 1);
    },
    // 角标数字：服务端数好返回（getOrderSummary），不把订单全拉下来数
    orderGrid() {
      const s = this.summary;
      return [
        { key: 'unpaid', icon: '/static/icon/pay.png', text: this.$t('os.tab.unpaid'), count: s.unpaid || 0, url: '/pages/order/list?tab=unpaid' },
        { key: 'pending_ship', icon: '/static/icon/box.png', text: this.$t('os.pending_ship'), count: s.pendingShip || 0, url: '/pages/order/list?tab=pending_ship' },
        { key: 'shipped', icon: '/static/icon/truck.png', text: this.$t('os.tab.receive'), count: s.shipped || 0, url: '/pages/order/list?tab=shipped' },
        // 退款/售后：角标是进行中的售后数
        { key: 'aftersale', icon: '/static/icon/aftersale.png', text: this.$t('as.entry'), count: s.afterSales || 0, url: '/pages/order/list?afterSales=1' }
      ];
    },
    invoiceGrid() {
      const s = this.summary;
      return [
        { key: 'issued', icon: '/static/icon/doc-check.png', text: this.$t('inv.issued'), count: 0 },
        { key: 'none', icon: '/static/icon/doc.png', text: this.$t('inv.none'), count: s.invoiceNone || 0 },
        { key: 'requesting', icon: '/static/icon/doc-clock.png', text: this.$t('inv.requesting'), count: s.invoiceRequesting || 0 }
      ];
    }
  },
  onShow() {
    // 启动时的静默登录失败过，进入这页再试一次
    if (this.state.status === 'fail') ensureLogin();
    this.loadCounts();
    this.refreshCacheSize();
  },
  methods: {
    onHeader() {
      if (this.state.status === 'fail') return ensureLogin(true);
      safeNavigate('/pages/profile/edit');
    },
    async loadCounts() {
      try {
        const [o, i] = await Promise.all([getOrderSummary(), getInvoiceTitles()]);
        if (o.data.code === 0) this.summary = o.data.data || {};
        if (i.data.code === 0) this.hasInvoiceInfo = (i.data.data || []).length > 0;
      } catch (e) {
        logError('mine.counts', { error: (e && (e.errMsg || e.message)) || String(e) });
      }
    },
    handleSelectLang(item) {
      setLang(item.id);
      this.showLangPopup = false;
    },
    async refreshCacheSize() {
      const { bytes } = await getFileCacheInfo();
      this.cacheSize = formatSize(bytes);
    },
    handleClearCache() {
      uni.showModal({
        title: this.$t('about.clearCache'),
        content: this.$t('about.clearConfirm'),
        confirmText: this.$t('common.confirm'),
        cancelText: this.$t('common.cancel'),
        success: async (res) => {
          if (!res.confirm) return;
          await clearAllCache();
          await this.refreshCacheSize();
          uni.showToast({ title: this.$t('about.cleared'), icon: 'none' });
          // 公司信息缓存被清掉了，重新取一次写回（公司页没有缓存时会先空一下）
          const lang = getLang();
          try {
            const { data } = await getCompanyInfo();
            if (data.code === 0) writeData('companyInfo', data.data, lang);
          } catch (e) {
            logError('mine.clearCache.company', { error: (e && (e.errMsg || e.message)) || String(e) });
          }
        }
      });
    },
    go(url) {
      safeNavigate(url);
    }
  }
};
</script>

<style lang="scss">
.mine-page {
  min-height: 100vh;
  background: #0e1a2d;
  padding: 24rpx;
  box-sizing: border-box;
}
.header {
  display: flex;
  align-items: center;
  padding: 32rpx 24rpx 40rpx;
}
.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar {
  overflow: hidden;
  flex-shrink: 0;
}
.avatar-img {
  width: 120rpx;
  height: 120rpx;
}
.avatar-text {
  color: #fff;
  font-size: 48rpx;
}
.phone {
  color: rgba(255, 255, 255, 0.55);
  font-size: 26rpx;
  margin-top: 8rpx;
}
.edit-icon {
  width: 40rpx;
  height: 40rpx;
  margin-left: auto;
  opacity: 0.7;
}
.who {
  display: flex;
  flex-direction: column;
  margin-left: 28rpx;
  min-width: 0;
}
.nickname {
  color: #fff;
  font-size: 36rpx;
  font-weight: 600;
}
.hint {
  color: #ff8a80;
  font-size: 24rpx;
  margin-top: 8rpx;
}

.two {
  display: flex;
}
.two-card {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  padding: 32rpx 24rpx;

  & + .two-card {
    margin-left: 20rpx;
  }
  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
}
.two-icon {
  width: 64rpx;
  height: 64rpx;
  flex-shrink: 0;
}
.two-text {
  display: flex;
  flex-direction: column;
  margin-left: 20rpx;
  min-width: 0;
}
.two-title {
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
}
.two-sub {
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
  margin-top: 6rpx;

  &.warn {
    color: #ffb74d;
  }
}

.block {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  margin-top: 20rpx;
  padding: 0 12rpx 12rpx;
}
.settings {
  padding: 0 12rpx;
}
.row {
  display: flex;
  align-items: center;
  padding: 30rpx 16rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
  }
}
.row-btn {
  width: 100%;
  margin: 0;
  background: transparent;
  border-radius: 0;
  text-align: left;
  font-size: inherit;
  line-height: normal;
  color: inherit;

  &::after {
    border: none;
  }
}
.row-icon {
  width: 44rpx;
  height: 44rpx;
  flex-shrink: 0;
}
.row-label {
  flex: 1;
  color: #fff;
  font-size: 28rpx;
  margin-left: 20rpx;
}
.row-value {
  color: rgba(255, 255, 255, 0.5);
  font-size: 26rpx;
}
.row-arrow {
  color: rgba(255, 255, 255, 0.4);
  font-size: 36rpx;
  margin-left: 12rpx;
}
.block-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 16rpx 12rpx;
}
.block-title {
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
}
.block-more {
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
}
.grid {
  display: flex;
}
.cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0 20rpx;
}
.cell-icon {
  position: relative;
  width: 64rpx;
  height: 64rpx;
}
.cell-img {
  width: 64rpx;
  height: 64rpx;
}
.badge {
  position: absolute;
  top: -12rpx;
  right: -22rpx;
  min-width: 34rpx;
  height: 34rpx;
  line-height: 34rpx;
  padding: 0 8rpx;
  box-sizing: border-box;
  text-align: center;
  border-radius: 17rpx;
  background: #ff5252;
  color: #fff;
  font-size: 20rpx;
}
.cell-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 26rpx;
  margin-top: 16rpx;
}
</style>
