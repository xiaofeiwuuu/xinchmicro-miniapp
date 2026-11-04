<template>
  <view class="page">
    <view class="form">
      <view class="row">
        <text class="label">{{ $t('inv.type') }}</text>
        <picker class="picker" :range="typeNames" :value="form.type === 'special' ? 1 : 0" @change="onType">
          <text class="value">{{ form.type === 'special' ? typeNames[1] : typeNames[0] }}</text>
        </picker>
      </view>
      <view class="row">
        <text class="label">{{ $t('inv.title') }}</text>
        <input v-model="form.title" class="input" maxlength="60" :placeholder="$t('inv.titlePh')" placeholder-class="ph" />
      </view>
      <view class="row">
        <text class="label">{{ $t('inv.taxId') }}</text>
        <input v-model="form.taxId" class="input" maxlength="20" :placeholder="$t('inv.taxIdPh')" placeholder-class="ph" />
      </view>
      <view class="row">
        <text class="label">{{ $t('inv.address') }}</text>
        <input v-model="form.address" class="input" maxlength="100" placeholder-class="ph" />
      </view>
      <view class="row">
        <text class="label">{{ $t('inv.phone') }}</text>
        <input v-model="form.phone" class="input" maxlength="20" placeholder-class="ph" />
      </view>
      <view class="row">
        <text class="label">{{ $t('inv.bank') }}</text>
        <input v-model="form.bank" class="input" maxlength="60" placeholder-class="ph" />
      </view>
      <view class="row">
        <text class="label">{{ $t('inv.account') }}</text>
        <input v-model="form.account" class="input" type="number" maxlength="30" placeholder-class="ph" />
      </view>
      <view class="row">
        <text class="label">{{ $t('inv.email') }}</text>
        <input v-model="form.email" class="input" maxlength="60" :placeholder="$t('inv.emailPh')" placeholder-class="ph" />
      </view>
    </view>
    <text class="hint">{{ $t('inv.specialHint') }}</text>

    <view class="save" :class="{ busy: saving }" @tap="save"><text>{{ $t('inv.save') }}</text></view>
  </view>
</template>

<script>
import { getInvoiceInfo, saveInvoiceInfo } from '@/api/shop.js';
import { logError } from '@/utils/logger.js';

export default {
  data() {
    return {
      form: { type: 'normal', title: '', taxId: '', address: '', phone: '', bank: '', account: '', email: '' },
      saving: false
    };
  },
  computed: {
    typeNames() {
      return [this.$t('inv.typeNormal'), this.$t('inv.typeSpecial')];
    }
  },
  async onLoad() {
    try {
      const { data } = await getInvoiceInfo();
      if (data.code === 0 && data.data) this.form = { ...this.form, ...data.data };
    } catch (e) {
      logError('invoice.load', { error: (e && (e.errMsg || e.message)) || String(e) });
    }
  },
  methods: {
    onType(e) {
      this.form.type = Number(e.detail.value) === 1 ? 'special' : 'normal';
    },
    toast(key) {
      uni.showToast({ title: this.$t(key), icon: 'none' });
    },
    async save() {
      if (this.saving) return;
      const f = {};
      Object.keys(this.form).forEach((k) => {
        f[k] = typeof this.form[k] === 'string' ? this.form[k].trim() : this.form[k];
      });
      if (!f.title) return this.toast('inv.badTitle');
      // 统一社会信用代码是 18 位；老税号 15~20 位，只检查长度和字符
      if (!/^[0-9A-Za-z]{15,20}$/.test(f.taxId)) return this.toast('inv.badTaxId');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return this.toast('inv.badEmail');
      if (f.type === 'special' && !(f.address && f.phone && f.bank && f.account)) return this.toast('inv.badSpecial');
      f.taxId = f.taxId.toUpperCase();
      this.saving = true;
      try {
        const { data } = await saveInvoiceInfo(f);
        if (data.code !== 0) throw new Error(data.message || 'save failed');
        uni.navigateBack();
      } catch (e) {
        logError('invoice.save', { error: (e && (e.errMsg || e.message)) || String(e) });
        this.toast('order.actionFail');
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #0e1a2d;
  padding: 24rpx;
  box-sizing: border-box;
}
.form {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  padding: 0 28rpx;
}
.row {
  display: flex;
  align-items: center;
  min-height: 104rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
  }
}
.label {
  width: 180rpx;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 28rpx;
}
.input,
.picker {
  flex: 1;
  color: #fff;
  font-size: 28rpx;
}
.value {
  color: #fff;
  font-size: 28rpx;
}
.ph {
  color: rgba(255, 255, 255, 0.3);
}
.hint {
  display: block;
  color: rgba(255, 255, 255, 0.45);
  font-size: 24rpx;
  line-height: 1.6;
  padding: 20rpx 8rpx 0;
}
.save {
  margin-top: 40rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #00a8ff, #0072ff);
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;

  &.busy {
    opacity: 0.6;
  }
}
</style>
