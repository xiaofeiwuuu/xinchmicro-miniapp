<template>
  <view class="page">
    <view class="form">
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
        <input v-model="form.address" class="input" maxlength="100" :placeholder="$t('inv.optional')" placeholder-class="ph" />
      </view>
      <view class="row">
        <text class="label">{{ $t('inv.phone') }}</text>
        <input v-model="form.phone" class="input" maxlength="20" :placeholder="$t('inv.optional')" placeholder-class="ph" />
      </view>
      <view class="row">
        <text class="label">{{ $t('inv.bank') }}</text>
        <input v-model="form.bank" class="input" maxlength="60" :placeholder="$t('inv.optional')" placeholder-class="ph" />
      </view>
      <view class="row">
        <text class="label">{{ $t('inv.account') }}</text>
        <input v-model="form.account" class="input" type="number" maxlength="30" :placeholder="$t('inv.optional')" placeholder-class="ph" />
      </view>
      <view class="row">
        <text class="label">{{ $t('inv.email') }}</text>
        <input v-model="form.email" class="input" maxlength="60" :placeholder="$t('inv.emailPh')" placeholder-class="ph" />
      </view>
      <view class="row">
        <text class="label">{{ $t('inv.setDefault') }}</text>
        <switch :checked="form.isDefault" color="#00a8ff" @change="form.isDefault = $event.detail.value" />
      </view>
    </view>
    <text class="hint">{{ $t('inv.specialHint') }}</text>

    <view class="actions">
      <view class="save" :class="{ busy: saving }" @tap="save"><text>{{ $t('inv.save') }}</text></view>
      <view v-if="form.id" class="del" @tap="remove"><text>{{ $t('inv.delete') }}</text></view>
    </view>
  </view>
</template>

<script>
import { getInvoiceTitles, saveInvoiceTitle, deleteInvoiceTitle } from '@/api/shop.js';
import { logError } from '@/utils/logger.js';

export default {
  data() {
    return {
      form: { id: null, title: '', taxId: '', address: '', phone: '', bank: '', account: '', email: '', isDefault: false },
      saving: false
    };
  },
  async onLoad(options) {
    const id = options && Number(options.id);
    if (!id) return;
    try {
      const { data } = await getInvoiceTitles();
      const t = data.code === 0 && data.data.find((x) => x.id === id);
      if (t) this.form = { ...this.form, ...t };
    } catch (e) {
      logError('invoice.edit.load', { error: (e && (e.errMsg || e.message)) || String(e) });
    }
  },
  methods: {
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
      // 邮箱选填；填了就要对
      if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return this.toast('inv.badEmail');
      f.taxId = f.taxId.toUpperCase();
      this.saving = true;
      try {
        const { data } = await saveInvoiceTitle(f);
        if (data.code !== 0) throw new Error(data.message || 'save failed');
        uni.navigateBack();
      } catch (e) {
        logError('invoice.title.save', { error: (e && (e.errMsg || e.message)) || String(e) });
        this.toast('order.actionFail');
      } finally {
        this.saving = false;
      }
    },
    remove() {
      uni.showModal({
        content: this.$t('inv.deleteConfirm'),
        cancelText: this.$t('ui.cancel'),
        confirmText: this.$t('ui.confirm'),
        success: async (res) => {
          if (!res.confirm) return;
          try {
            await deleteInvoiceTitle(this.form.id);
            uni.navigateBack();
          } catch (e) {
            logError('invoice.title.delete', { error: (e && (e.errMsg || e.message)) || String(e) });
            this.toast('order.actionFail');
          }
        }
      });
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
.input {
  flex: 1;
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
.actions {
  margin-top: 40rpx;
}
.save {
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
.del {
  margin-top: 28rpx;
  text-align: center;
  color: #ff8a80;
  font-size: 28rpx;
  padding: 16rpx;
}
</style>
