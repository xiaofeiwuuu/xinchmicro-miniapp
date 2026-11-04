<template>
  <view class="page">
    <view class="avatar-box">
      <!-- open-type="chooseAvatar"：微信弹出自己的头像选择器（微信头像 / 相册 / 拍照），回调拿到本地临时路径 -->
      <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image v-if="form.avatar" :src="form.avatar" class="avatar-img" mode="aspectFill"></image>
        <text v-else class="avatar-text">{{ initial }}</text>
      </button>
      <text class="avatar-tip">{{ $t('prof.avatarTip') }}</text>
    </view>

    <view class="form">
      <view class="row">
        <text class="label">{{ $t('prof.nickname') }}</text>
        <!-- type="nickname"：键盘上方会出现「使用微信昵称」 -->
        <input
          class="input"
          type="nickname"
          maxlength="20"
          :value="form.nickname"
          :placeholder="$t('prof.nicknamePh')"
          placeholder-class="ph"
          @input="form.nickname = $event.detail.value"
          @blur="form.nickname = $event.detail.value"
        />
      </view>
      <!-- 整行就是一个 getPhoneNumber 按钮：点这一行任何位置都直接弹出微信授权框，不能手填。
           （微信规定只有 button 能触发手机号授权，所以这里是把 button 做成一行的样子） -->
      <button class="row row-btn" open-type="getPhoneNumber" :disabled="binding" @getphonenumber="onPhone">
        <text class="label">{{ $t('prof.phone') }}</text>
        <text class="phone-text" :class="{ none: !form.phone }">{{ form.phone || $t('prof.phoneGet') }}</text>
        <text v-if="form.phone" class="phone-change">{{ $t('prof.phoneChange') }}</text>
        <text class="row-arrow">›</text>
      </button>
    </view>

    <view class="save" :class="{ busy: saving }" @tap="save"><text>{{ $t('prof.save') }}</text></view>
  </view>
</template>

<script>
import { saveProfile, bindPhone } from '@/api/shop.js';
import { customerState, ensureLogin } from '@/utils/customer.js';
import { logError } from '@/utils/logger.js';

export default {
  data() {
    return { form: { avatar: '', nickname: '', phone: '' }, saving: false, binding: false };
  },
  computed: {
    initial() {
      return (this.form.nickname || this.$t('mine.guest')).slice(0, 1);
    }
  },
  onLoad() {
    const c = customerState.customer || {};
    this.form = { avatar: c.avatar || '', nickname: c.nickname || '', phone: c.phone || '' };
  },
  methods: {
    onChooseAvatar(e) {
      this.form.avatar = e.detail.avatarUrl;
    },
    toast(key) {
      uni.showToast({ title: this.$t(key), icon: 'none' });
    },
    // 手机号授权结果。用户拒绝授权时不提示（是他的选择）；其它失败才提示
    async onPhone(e) {
      const d = e.detail || {};
      if (!d.code) {
        if (d.errMsg && !/deny|cancel/i.test(d.errMsg)) this.toast('prof.phoneFail');
        return;
      }
      if (this.binding) return;
      this.binding = true;
      try {
        if (!(await ensureLogin())) return this.toast('oc.loginFail');
        const { data } = await bindPhone(d.code);
        if (data.code !== 0) throw new Error(data.message || 'bind failed');
        this.form.phone = data.data.phone;
        customerState.customer = { ...(customerState.customer || {}), phone: data.data.phone };
      } catch (err) {
        logError('profile.phone', { error: (err && (err.errMsg || err.message)) || String(err) });
        this.toast('prof.phoneFail');
      } finally {
        this.binding = false;
      }
    },
    async save() {
      if (this.saving) return;
      this.saving = true;
      try {
        if (!(await ensureLogin())) return this.toast('oc.loginFail');
        const profile = { nickname: (this.form.nickname || '').trim(), phone: this.form.phone, avatar: this.form.avatar };
        const { data } = await saveProfile(profile);
        if (data.code !== 0) throw new Error(data.message || 'save failed');
        customerState.customer = { ...(customerState.customer || {}), ...data.data };
        this.toast('prof.saved');
        setTimeout(() => uni.navigateBack(), 500);
      } catch (e) {
        logError('profile.save', { error: (e && (e.errMsg || e.message)) || String(e) });
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
.avatar-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0 40rpx;
}
// 去掉 button 默认的边框和内边距，让它就是一个圆形头像
.avatar-btn {
  width: 160rpx;
  height: 160rpx;
  padding: 0;
  margin: 0;
  border-radius: 80rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    border: none;
  }
}
.avatar-img {
  width: 160rpx;
  height: 160rpx;
}
.avatar-text {
  color: #fff;
  font-size: 64rpx;
}
.avatar-tip {
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
  margin-top: 20rpx;
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
  width: 160rpx;
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
.phone-text {
  flex: 1;
  color: #fff;
  font-size: 28rpx;

  &.none {
    color: rgba(255, 255, 255, 0.3);
  }
}
// button 默认有边框、内边距、居中文字：全部去掉，让它和普通的一行一样
.row-btn {
  width: 100%;
  margin: 0;
  padding: 0;
  background: transparent;
  border-radius: 0;
  text-align: left;
  font-size: inherit;
  line-height: normal;
  color: inherit;
  border-bottom: none;

  &::after {
    border: none;
  }
}
.phone-change {
  color: #00a8ff;
  font-size: 26rpx;
  margin-left: 16rpx;
}
.row-arrow {
  color: rgba(255, 255, 255, 0.4);
  font-size: 36rpx;
  margin-left: 12rpx;
}
.save {
  margin-top: 48rpx;
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
