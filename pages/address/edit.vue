<template>
  <view class="page">
    <view class="form">
      <view class="row">
        <text class="label">{{ $t('addr.consignee') }}</text>
        <input v-model="form.consignee" class="input" maxlength="30" :placeholder="$t('addr.consigneePh')" placeholder-class="ph" />
      </view>
      <view class="row">
        <text class="label">{{ $t('addr.phone') }}</text>
        <input v-model="form.phone" class="input" type="text" maxlength="20" :placeholder="$t('addr.phonePh')" placeholder-class="ph" />
      </view>
      <view class="row">
        <text class="label">{{ $t('addr.region') }}</text>
        <picker mode="region" class="picker" @change="onRegion">
          <text :class="form.region ? 'value' : 'ph-text'">{{ form.region || $t('addr.regionPh') }}</text>
        </picker>
      </view>
      <view class="row top">
        <text class="label">{{ $t('addr.detail') }}</text>
        <!-- 多行输入：能换行，高度随内容增长（楼栋、楼层、收货备注等写得下） -->
        <textarea
          class="textarea"
          :value="form.detail"
          maxlength="200"
          auto-height
          :show-confirm-bar="false"
          :placeholder="$t('addr.detailPh')"
          placeholder-class="ph"
          @input="form.detail = $event.detail.value"
        />
      </view>
      <view class="row">
        <text class="label">{{ $t('addr.setDefault') }}</text>
        <switch :checked="form.isDefault" color="#00a8ff" @change="form.isDefault = $event.detail.value" />
      </view>
    </view>

    <view class="actions">
      <view class="save" :class="{ busy: saving }" @tap="save"><text>{{ $t('addr.save') }}</text></view>
      <view v-if="form.id" class="del" @tap="remove"><text>{{ $t('addr.delete') }}</text></view>
    </view>
  </view>
</template>

<script>
import { getAddresses, saveAddress, deleteAddress } from '@/api/shop.js';
import { logError } from '@/utils/logger.js';

export default {
  data() {
    return {
      form: { id: null, consignee: '', phone: '', region: '', detail: '', isDefault: false },
      saving: false
    };
  },
  async onLoad(options) {
    const id = options && Number(options.id);
    if (!id) return;
    try {
      const { data } = await getAddresses();
      const a = data.code === 0 && data.data.find((x) => x.id === id);
      if (a) this.form = { ...a };
    } catch (e) {
      logError('address.edit.load', { error: (e && (e.errMsg || e.message)) || String(e) });
    }
  },
  methods: {
    onRegion(e) {
      // picker 返回 [省, 市, 区]；直辖市的省和市同名，只留一个
      const [p, c, d] = e.detail.value;
      this.form.region = [p, c === p ? '' : c, d].filter(Boolean).join(' ');
    },
    toast(key) {
      uni.showToast({ title: this.$t(key), icon: 'none' });
    },
    async save() {
      if (this.saving) return;
      const f = this.form;
      const phone = (f.phone || '').trim();
      if (!f.consignee.trim()) return this.toast('addr.badConsignee');
      if (!/^[+\d][\d\- ]{5,19}$/.test(phone)) return this.toast('addr.badPhone');
      if (!f.region) return this.toast('addr.badRegion');
      // 整理多行地址：去掉每行首尾空白和空行
      const detail = f.detail.split('\n').map((x) => x.trim()).filter(Boolean).join('\n');
      if (!detail) return this.toast('addr.badDetail');
      this.saving = true;
      try {
        const { data } = await saveAddress({ ...f, consignee: f.consignee.trim(), phone, detail });
        if (data.code !== 0) throw new Error(data.message || 'save failed');
        uni.navigateBack();
      } catch (e) {
        logError('address.save', { error: (e && (e.errMsg || e.message)) || String(e) });
        this.toast('order.actionFail');
      } finally {
        this.saving = false;
      }
    },
    remove() {
      uni.showModal({
        content: this.$t('addr.deleteConfirm'),
        cancelText: this.$t('ui.cancel'),
        confirmText: this.$t('ui.confirm'),
        success: async (res) => {
          if (!res.confirm) return;
          try {
            await deleteAddress(this.form.id);
            uni.navigateBack();
          } catch (e) {
            logError('address.delete', { error: (e && (e.errMsg || e.message)) || String(e) });
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

  // 多行输入的那一行：标签对齐第一行，上下留出内边距
  &.top {
    align-items: flex-start;
    padding: 28rpx 0;
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
.textarea {
  flex: 1;
  min-height: 48rpx;
  line-height: 1.5;
  color: #fff;
  font-size: 28rpx;
}
.ph {
  color: rgba(255, 255, 255, 0.3);
}
.ph-text {
  color: rgba(255, 255, 255, 0.3);
  font-size: 28rpx;
}
.value {
  color: #fff;
  font-size: 28rpx;
}
.actions {
  margin-top: 48rpx;
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
