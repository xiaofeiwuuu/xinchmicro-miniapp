<!-- 注销账号：先说明会清除什么、保留什么，再检查有没有没完成的订单/售后/开票/退款（有就不能注销，列出原因），没问题才能确认注销。
     注销成功后清掉登录状态和本机购物车，回到首页（再进来是全新的客户）。 -->
<template>
  <view class="page">
    <scroll-view scroll-y class="body">
      <view class="card">
        <text class="title">{{ $t('acct.warnTitle') }}</text>
        <!-- 文案里用 **…** 标出要加粗的部分 -->
        <text v-for="k in ['acct.warn1', 'acct.warn2', 'acct.warn3']" :key="k" class="p">
          <text v-for="(s, i) in segs(k)" :key="i" :class="{ strong: s.b }">{{ s.t }}</text>
        </text>
      </view>

      <RetryState v-if="failed" @retry="check" />
      <view v-else-if="checked && blockers.length" class="card block">
        <text class="title warn">{{ $t('acct.blockTitle') }}</text>
        <text v-for="(b, i) in blockers" :key="i" class="p">· {{ b }}</text>
      </view>
      <view v-else-if="checked" class="card">
        <text class="title ok">{{ $t('acct.canTitle') }}</text>
      </view>
      <text v-else class="checking">{{ $t('acct.checking') }}</text>
      <view class="space"></view>
    </scroll-view>

    <view class="footer">
      <view class="btn" :class="{ disabled: !canSubmit, busy: busy }" @tap="submit"><text>{{ $t('acct.btn') }}</text></view>
    </view>
  </view>
</template>

<script>
import { getDeleteCheck, deleteAccount } from '@/api/shop.js';
import { clearSession } from '@/utils/customer.js';
import { clearCart } from '@/utils/cart.js';
import { logError } from '@/utils/logger.js';
import RetryState from '@/components/RetryState.vue';

export default {
  components: { RetryState },
  data() {
    return { checked: false, failed: false, blockers: [], canDelete: false, busy: false };
  },
  computed: {
    canSubmit() {
      return this.checked && this.canDelete;
    }
  },
  onShow() {
    this.check();
  },
  methods: {
    // 把文案按 ** 切开，奇数段加粗
    segs(key) {
      return String(this.$t(key))
        .split('**')
        .map((t, i) => ({ t, b: i % 2 === 1 }))
        .filter((s) => s.t);
    },
    async check() {
      this.failed = false;
      try {
        const { data } = await getDeleteCheck();
        if (data.code !== 0) throw new Error(data.message || 'check failed');
        this.blockers = data.data.blockers || [];
        this.canDelete = !!data.data.canDelete;
        this.checked = true;
      } catch (e) {
        logError('account.deleteCheck', { error: (e && (e.errMsg || e.message)) || String(e) });
        if (!this.checked) this.failed = true;
      }
    },
    submit() {
      if (!this.canSubmit || this.busy) return;
      uni.showModal({
        content: this.$t('acct.confirm'),
        cancelText: this.$t('ui.cancel'),
        confirmText: this.$t('ui.confirm'),
        confirmColor: '#ff4d4f',
        success: async (res) => {
          if (!res.confirm) return;
          this.busy = true;
          try {
            const { data } = await deleteAccount();
            if (data.code !== 0) {
              // 刚好有了新的订单等：服务端会再检查一次，把原因告诉用户
              uni.showToast({ title: data.message || this.$t('acct.fail'), icon: 'none', duration: 2500 });
              this.check();
              return;
            }
            clearSession();
            clearCart();
            uni.showToast({ title: this.$t('acct.done'), icon: 'none' });
            setTimeout(() => uni.reLaunch({ url: '/pages/home/index' }), 800);
          } catch (e) {
            logError('account.delete', { error: (e && (e.errMsg || e.message)) || String(e) });
            uni.showToast({ title: this.$t('acct.fail'), icon: 'none' });
          } finally {
            this.busy = false;
          }
        }
      });
    }
  }
};
</script>

<style lang="scss">
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0e1a2d;
}
.body {
  flex: 1;
  min-height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}
.card {
  margin-bottom: 24rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.06);

  &.block {
    background: rgba(255, 77, 79, 0.1);
  }
}
.title {
  display: block;
  margin-bottom: 12rpx;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;

  &.warn {
    color: #ff7875;
  }
  &.ok {
    color: #81c784;
    margin-bottom: 0;
  }
}
.p {
  display: block;
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.75);
  font-size: 27rpx;
  line-height: 1.7;
}
.strong {
  color: #fff;
  font-weight: 700;
}
.checking {
  color: rgba(255, 255, 255, 0.5);
  font-size: 26rpx;
}
.space {
  height: 40rpx;
}
.footer {
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #122642;
}
.btn {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 48rpx;
  background: #ff4d4f;
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;

  &.disabled {
    opacity: 0.4;
  }
}
</style>
