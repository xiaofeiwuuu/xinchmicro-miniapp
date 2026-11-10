<!-- 收货地址的底部弹窗：新增 / 编辑。address 为空是新增；有 id 是编辑（带「删除」）。
     保存成功触发 saved，删除成功触发 deleted，点遮罩或「取消」触发 close；列表由父页面自己刷新。 -->
<template>
  <view v-if="visible" class="as-root">
    <view class="as-mask" @tap="$emit('close')"></view>
    <view class="as-sheet">
      <view class="as-head">
        <text class="as-title">{{ form.id ? $t('addr.editTitle') : $t('addr.addTitle') }}</text>
      </view>

      <scroll-view scroll-y class="as-body">
        <!-- 新增时可以从微信导入，导入后还能改，点保存才存 -->
        <view v-if="!form.id" class="as-import" @tap="importWechat">
          <text class="as-import-text">{{ $t('addr.importWx') }}</text>
          <view class="as-import-arrow"></view>
        </view>

        <view class="as-form">
          <view class="as-row">
            <text class="as-label">{{ $t('addr.consignee') }}</text>
            <input v-model="form.consignee" class="as-input" maxlength="30" :placeholder="$t('addr.consigneePh')" placeholder-class="as-ph" />
          </view>
          <view class="as-row">
            <text class="as-label">{{ $t('addr.phone') }}</text>
            <input v-model="form.phone" class="as-input" type="text" maxlength="20" :placeholder="$t('addr.phonePh')" placeholder-class="as-ph" />
          </view>
          <view class="as-row">
            <text class="as-label">{{ $t('addr.region') }}</text>
            <picker mode="region" class="as-picker" @change="onRegion">
              <text :class="form.region ? 'as-value' : 'as-ph-text'">{{ form.region || $t('addr.regionPh') }}</text>
            </picker>
          </view>
          <view class="as-row as-top">
            <text class="as-label">{{ $t('addr.detail') }}</text>
            <!-- 多行输入：能换行，高度随内容增长 -->
            <textarea
              class="as-textarea"
              :value="form.detail"
              maxlength="200"
              auto-height
              :show-confirm-bar="false"
              :placeholder="$t('addr.detailPh')"
              placeholder-class="as-ph"
              @input="form.detail = $event.detail.value"
            />
          </view>
          <view class="as-row">
            <text class="as-label">{{ $t('addr.setDefault') }}</text>
            <switch :checked="form.isDefault" color="#00a8ff" @change="form.isDefault = $event.detail.value" />
          </view>
        </view>
      </scroll-view>

      <view class="as-actions">
        <view v-if="form.id" class="as-btn as-del" @tap="remove"><text>{{ $t('addr.delete') }}</text></view>
        <view class="as-btn as-save" :class="{ busy: saving }" @tap="save"><text>{{ $t('addr.save') }}</text></view>
      </view>
    </view>
  </view>
</template>

<script>
import { saveAddress, deleteAddress, errorText } from '@/api/shop.js';
import { logError } from '@/utils/logger.js';

const blank = () => ({ id: null, consignee: '', phone: '', region: '', detail: '', isDefault: false });

export default {
  name: 'AddressSheet',
  props: {
    visible: { type: Boolean, default: false },
    address: { type: Object, default: null }
  },
  data() {
    return { form: blank(), saving: false };
  },
  watch: {
    // 每次打开都重新装入表单：新增是空白，编辑是这条地址
    visible(v) {
      if (v) this.form = this.address ? { ...blank(), ...this.address } : blank();
    }
  },
  methods: {
    toast(key) {
      uni.showToast({ title: this.$t(key), icon: 'none' });
    },
    onRegion(e) {
      // picker 返回 [省, 市, 区]；直辖市的省和市同名，只留一个
      const [p, c, d] = e.detail.value;
      this.form.region = [p, c === p ? '' : c, d].filter(Boolean).join(' ');
    },
    // 微信收货地址：弹出微信自己的地址选择。用户取消不提示；没授权或接口不可用才提示
    importWechat() {
      uni.chooseAddress({
        success: (r) => {
          const region = [r.provinceName, r.cityName === r.provinceName ? '' : r.cityName, r.countyName].filter(Boolean).join(' ');
          this.form = {
            ...this.form,
            consignee: r.userName || this.form.consignee,
            phone: r.telNumber || this.form.phone,
            region: region || this.form.region,
            detail: r.detailInfo || this.form.detail
          };
        },
        fail: (e) => {
          const msg = (e && e.errMsg) || '';
          if (/cancel/i.test(msg)) return;
          logError('address.importWx', { error: msg });
          this.toast('addr.importFail');
        }
      });
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
        if (data.code !== 0) {
          const err = new Error(data.message || 'save failed');
          err.userMessage = errorText(data); // 内容不合规：告诉用户
          throw err;
        }
        this.$emit('saved', data.data);
      } catch (e) {
        logError('address.save', { error: (e && (e.errMsg || e.message)) || String(e) });
        if (e && e.userMessage) uni.showToast({ title: e.userMessage, icon: 'none' });
        else this.toast('order.actionFail');
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
            const { data } = await deleteAddress(this.form.id);
            if (data.code !== 0) throw new Error(data.message || 'delete failed');
            this.$emit('deleted', this.form.id);
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
.as-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 30;
  background: rgba(0, 0, 0, 0.55);
}
.as-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 31;
  display: flex;
  flex-direction: column;
  max-height: 86vh;
  background: #0f1c31;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28rpx 28rpx 0 0;
  padding: 32rpx 28rpx;
  padding-bottom: calc(56rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(56rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.as-head {
  margin-bottom: 8rpx;
}
.as-title {
  display: block;
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
  text-align: center;
}
.as-body {
  flex: 1;
  min-height: 0;
  max-height: 62vh;
}
// 微信绿的纯文字入口，靠右
.as-import {
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  &:active {
    opacity: 0.5;
  }
}
.as-import-text {
  color: #07c160;
  font-size: 26rpx;
}
.as-import-arrow {
  width: 12rpx;
  height: 12rpx;
  margin-left: 8rpx;
  border-top: 3rpx solid #07c160;
  border-right: 3rpx solid #07c160;
  transform: rotate(45deg);
}
.as-form {
  margin-top: 8rpx;
  background: #182a47; // 实色：比弹窗底亮一档，不再用半透明白（叠在蓝底上会发灰）
  border-radius: 16rpx;
  padding: 0 28rpx;
}
.as-row {
  display: flex;
  align-items: center;
  min-height: 104rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);

  &:last-child {
    border-bottom: none;
  }
  &.as-top {
    align-items: flex-start;
    padding: 28rpx 0;
  }
}
.as-label {
  width: 200rpx; // 「设为默认地址」6 个字要放得下，不折行
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 28rpx;
}
.as-input {
  flex: 1;
  color: #fff;
  font-size: 28rpx;
}
.as-picker {
  flex: 1;
}
.as-value {
  color: #fff;
  font-size: 28rpx;
}
.as-ph-text {
  color: rgba(255, 255, 255, 0.3);
  font-size: 28rpx;
}
.as-ph {
  color: rgba(255, 255, 255, 0.3);
}
.as-textarea {
  flex: 1;
  min-height: 48rpx;
  color: #fff;
  font-size: 28rpx;
  line-height: 1.5;
}
.as-actions {
  display: flex;
  margin-top: 24rpx;
}
.as-btn {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 700;
}
.as-save {
  background: linear-gradient(135deg, #00a8ff, #0072ff);
  color: #fff;

  &.busy {
    opacity: 0.6;
  }
}
.as-del {
  flex: 0 0 220rpx;
  margin-right: 20rpx;
  background: rgba(255, 138, 128, 0.12);
  color: #ff8a80;
  font-weight: 600;
}
</style>
