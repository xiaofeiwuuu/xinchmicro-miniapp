<template>
  <view class="page">
    <view class="icon"><text class="icon-mark">!</text></view>
    <text class="title">{{ $t('blocked.title') }}</text>
    <text class="desc">{{ $t('blocked.desc') }}</text>

    <view v-if="phone" class="btn main" @tap="call"><text>{{ $t('blocked.contact') }}　{{ phone }}</text></view>
    <view class="btn ghost" :class="{ busy: checking }" @tap="recheck"><text>{{ $t('blocked.retry') }}</text></view>
  </view>
</template>

<script>
import { ensureLogin, isBlocked } from '@/utils/customer.js';
import { getCompanyInfo } from '@/api/index.js';
import { readData, writeData } from '@/utils/cache.js';
import { getLang } from '@/utils/i18n.js';

export default {
  data() {
    return { phone: '', checking: false };
  },
  onShow() {
    this.loadPhone();
  },
  methods: {
    // 联系电话：优先用本地缓存的公司信息，没有再取一次（这个页面是公开接口，不需要登录）
    async loadPhone() {
      const first = (info) => (info && Array.isArray(info.contacts) && info.contacts[0]) || '';
      this.phone = first(readData('companyInfo'));
      if (this.phone) return;
      const lang = getLang();
      try {
        const { data } = await getCompanyInfo();
        if (data.code === 0) {
          writeData('companyInfo', data.data, lang);
          this.phone = first(data.data);
        }
      } catch (e) {
        // 没网就不显示电话
      }
    },
    call() {
      uni.makePhoneCall({ phoneNumber: this.phone, fail() {} });
    },
    // 后台恢复了账号：重新登录成功就回到首页；仍然被限制就提示
    async recheck() {
      if (this.checking) return;
      this.checking = true;
      try {
        await ensureLogin(true);
        if (isBlocked()) {
          uni.showToast({ title: this.$t('blocked.still'), icon: 'none' });
        } else {
          uni.reLaunch({ url: '/pages/home/index' });
        }
      } finally {
        this.checking = false;
      }
    }
  }
};
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #0e1a2d;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 60rpx 0;
  box-sizing: border-box;
}
.icon {
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  border: 6rpx solid #ff8a80;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-mark {
  color: #ff8a80;
  font-size: 88rpx;
  font-weight: 700;
  line-height: 1;
}
.title {
  color: #fff;
  font-size: 40rpx;
  font-weight: 700;
  margin-top: 48rpx;
}
.desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 28rpx;
  line-height: 1.7;
  text-align: center;
  margin-top: 24rpx;
}
.btn {
  width: 100%;
  height: 88rpx;
  margin-top: 40rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;

  &.main {
    margin-top: 72rpx;
    background: linear-gradient(135deg, #00a8ff, #0072ff);
    color: #fff;
    font-weight: 700;
  }
  &.ghost {
    border: 1px solid rgba(255, 255, 255, 0.35);
    color: rgba(255, 255, 255, 0.85);
  }
  &.busy {
    opacity: 0.6;
  }
}
</style>
