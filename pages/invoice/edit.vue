<template>
  <view class="page">
    <view class="form">
      <!-- 抬头类型：企业（要税号，专票还要地址电话开户行账号）/ 个人（只要姓名，只能开普票） -->
      <view class="row">
        <text class="label">{{ $t('inv.kind') }}</text>
        <view class="seg">
          <view class="seg-item" :class="{ on: personal }" @tap="form.kind = 'personal'"><text>{{ $t('inv.kindPersonal') }}</text></view>
          <view class="seg-item" :class="{ on: !personal }" @tap="form.kind = 'company'"><text>{{ $t('inv.kindCompany') }}</text></view>
        </view>
      </view>
      <view class="row">
        <text class="label">{{ $t(personal ? 'inv.name' : 'inv.title') }}</text>
        <input v-model="form.title" class="input" :maxlength="personal ? 50 : 60" :placeholder="$t(personal ? 'inv.namePh' : 'inv.titlePh')" placeholder-class="ph" />
      </view>
      <template v-if="!personal">
        <view class="row">
          <text class="label">{{ $t('inv.taxId') }}</text>
          <input v-model="form.taxId" class="input" maxlength="20" :placeholder="$t('inv.taxIdPh')" placeholder-class="ph" />
        </view>
        <!-- 企业再选开普票还是专票：普票只要名称和税号；专票还要填全地址、电话、开户银行和账号 -->
        <view class="row">
          <text class="label">{{ $t('inv.type') }}</text>
          <view class="seg">
            <view class="seg-item" :class="{ on: !special }" @tap="invType = 'normal'"><text>{{ $t('inv.tNormal') }}</text></view>
            <view class="seg-item" :class="{ on: special }" @tap="invType = 'special'"><text>{{ $t('inv.tSpecial') }}</text></view>
          </view>
        </view>
        <template v-if="special">
          <view class="row">
            <text class="label">{{ $t('inv.address') }}</text>
            <input v-model="form.address" class="input" maxlength="100" :placeholder="$t('inv.required')" placeholder-class="ph" />
          </view>
          <view class="row">
            <text class="label">{{ $t('inv.phone') }}</text>
            <input v-model="form.phone" class="input" maxlength="20" :placeholder="$t('inv.required')" placeholder-class="ph" />
          </view>
          <view class="row">
            <text class="label">{{ $t('inv.bank') }}</text>
            <input v-model="form.bank" class="input" maxlength="60" :placeholder="$t('inv.required')" placeholder-class="ph" />
          </view>
          <view class="row">
            <text class="label">{{ $t('inv.account') }}</text>
            <input v-model="form.account" class="input" type="number" maxlength="30" :placeholder="$t('inv.required')" placeholder-class="ph" />
          </view>
        </template>
      </template>
      <view class="row">
        <text class="label">{{ $t('inv.setDefault') }}</text>
        <switch :checked="form.isDefault" color="#00a8ff" @change="form.isDefault = $event.detail.value" />
      </view>
    </view>

    <view class="actions">
      <view class="save" :class="{ busy: saving }" @tap="save"><text>{{ $t('inv.save') }}</text></view>
      <view v-if="form.id" class="del" @tap="remove"><text>{{ $t('inv.delete') }}</text></view>
    </view>
  </view>
</template>

<script>
import { getInvoiceTitles, saveInvoiceTitle, deleteInvoiceTitle, errorText } from '@/api/shop.js';
import { logError } from '@/utils/logger.js';

export default {
  data() {
    return {
      form: { id: null, kind: 'personal', title: '', taxId: '', address: '', phone: '', bank: '', account: '', isDefault: false },
      invType: 'normal', // 企业抬头的发票类型（只是界面选择，不单独保存：专票 = 地址、电话、开户行、账号都填了）
      saving: false
    };
  },
  async onLoad(options) {
    const id = options && Number(options.id);
    if (!id) return;
    try {
      const { data } = await getInvoiceTitles();
      const t = data.code === 0 && data.data.find((x) => x.id === id);
      if (t) {
        this.form = { ...this.form, ...t };
        if (t.kind !== 'personal' && t.address && t.phone && t.bank && t.account) this.invType = 'special'; // 资料填全的老抬头，打开就是专票
      }
    } catch (e) {
      logError('invoice.edit.load', { error: (e && (e.errMsg || e.message)) || String(e) });
    }
  },
  computed: {
    personal() {
      return this.form.kind === 'personal';
    },
    special() {
      return !this.personal && this.invType === 'special';
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
      if (!f.title) return this.toast(this.personal ? 'inv.badName' : 'inv.badTitle');
      // 统一社会信用代码是 18 位；老税号 15~20 位，只检查长度和字符（个人抬头没有税号）
      if (!this.personal && !/^[0-9A-Za-z]{15,20}$/.test(f.taxId)) return this.toast('inv.badTaxId');
      f.taxId = this.personal ? '' : f.taxId.toUpperCase();
      // 专票要填全四项；普票和个人不带这四项（改成普票会清掉原来填的）
      if (this.special) {
        if (!f.address || !f.phone || !f.bank || !f.account) return this.toast('inv.badSpecial');
      } else {
        f.address = '';
        f.phone = '';
        f.bank = '';
        f.account = '';
      }
      this.saving = true;
      try {
        const { data } = await saveInvoiceTitle(f);
        if (data.code !== 0) {
          const err = new Error(data.message || 'save failed');
          err.userMessage = errorText(data); // 内容不合规：告诉用户
          throw err;
        }
        uni.navigateBack();
      } catch (e) {
        logError('invoice.title.save', { error: (e && (e.errMsg || e.message)) || String(e) });
        if (e && e.userMessage) uni.showToast({ title: e.userMessage, icon: 'none' });
        else this.toast('order.actionFail');
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
// 企业 / 个人 切换
.seg {
  flex: 1;
  display: flex;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 14rpx;
  padding: 6rpx;
}
.seg-item {
  flex: 1;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
  color: rgba(255, 255, 255, 0.7);
  font-size: 26rpx;

  &.on {
    background: #0072ff;
    color: #fff;
    font-weight: 700;
  }
}
.actions {
  margin-top: 40rpx;
}
.save {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 48rpx;
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
