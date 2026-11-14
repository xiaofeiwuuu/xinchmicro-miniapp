<template>
  <view class="page">
    <LoadingState v-if="loading" />
    <EmptyState v-else-if="gone" :text="$t('video.gone')" />
    <RetryState v-else-if="failed" @retry="load" />
    <view v-else>
      <view class="item">
        <view class="thumb">
          <image v-if="d.coverUrl" :src="d.coverUrl" mode="aspectFill" class="thumb-img"></image>
          <text v-else class="thumb-ph">▶</text>
        </view>
        <view class="item-r">
          <text class="i-title">{{ d.title }}</text>
          <text class="i-sub">{{ d.courseTitle }}</text>
        </view>
      </view>

      <view class="card">
        <view class="row"><text class="lab">{{ $t('video.price') }}</text><text :class="['val', { cut: d.listPriceFen }]">¥{{ yuan(d.listPriceFen || d.priceFen) }}</text></view>
        <view v-if="d.listPriceFen" class="row"><text class="lab">{{ $t('video.memberPrice') }}</text><text class="val member">-¥{{ yuan(d.listPriceFen - d.priceFen) }}</text></view>
        <view class="row total"><text class="lab">{{ $t('video.payable') }}</text><text class="amount">¥{{ yuan(d.priceFen) }}</text></view>
      </view>

      <view class="card notes">
        <text class="n-h">{{ $t('video.notes') }}</text>
        <text class="n-t">· {{ $t('video.note1') }}</text>
        <text class="n-t">· {{ $t('video.note2') }}</text>
        <text class="n-t">· {{ $t('video.note3') }}</text>
        <text class="n-t">· {{ $t('video.note4') }}</text>
      </view>

      <view class="bar">
        <button v-if="need === 'phone'" class="pay" open-type="getPhoneNumber" @getphonenumber="onPhone">{{ $t('video.bindPhone') }}</button>
        <view v-else :class="['pay', { busy }]" @tap="pay">{{ $t('video.payBtn', { n: yuan(d.priceFen) }) }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import LoadingState from '@/components/LoadingState.vue';
import RetryState from '@/components/RetryState.vue';
import EmptyState from '@/components/EmptyState.vue';
import { getVideoDetail, createVideoOrder, bindPhone } from '@/api/shop.js';
import { payVideoOrder } from '@/utils/pay.js';
import { customerState } from '@/utils/customer.js';

export default {
  components: { LoadingState, RetryState, EmptyState },
  data() {
    return { id: 0, loading: true, failed: false, gone: false, d: {}, need: '', busy: false };
  },
  onLoad(q) {
    this.id = Number(q.id) || 0;
    this.load();
  },
  methods: {
    yuan(fen) {
      return (Number(fen) / 100).toFixed(2).replace(/\.00$/, '');
    },
    toast(key) {
      uni.showToast({ title: this.$t(key), icon: 'none' });
    },
    async load() {
      this.failed = false;
      this.loading = true;
      try {
        const { data, statusCode } = await getVideoDetail(this.id);
        if (statusCode === 404 || (data && data.errorCode === 'NOT_FOUND')) { this.gone = true; return; }
        if (data.code !== 0) throw new Error('load failed');
        this.d = data.data;
        // 免费或已经买过：不用在这里付款，回播放页
        if (this.d.owned) { this.toast(this.d.free ? 'video.freeTip' : 'video.alreadyOwned'); setTimeout(() => uni.navigateBack(), 800); }
      } catch (e) {
        this.failed = true;
      } finally {
        this.loading = false;
      }
    },
    async pay() {
      if (this.busy) return;
      this.busy = true;
      try {
        const { data } = await createVideoOrder(this.id);
        if (data.code !== 0) {
          if (data.errorCode === 'PHONE_REQUIRED') { this.need = 'phone'; return; }
          if (data.errorCode === 'OWNED') { this.toast('video.alreadyOwned'); uni.$emit('video:bought', this.id); setTimeout(() => uni.navigateBack(), 800); return; }
          if (data.errorCode === 'NOT_FOUND') { this.gone = true; return; }
          return this.toast('video.payFail');
        }
        const r = await payVideoOrder(data.data.orderNo);
        if (r === 'success' || r === 'pending') {
          this.toast(r === 'success' ? 'video.paySuccess' : 'video.payPending');
          uni.$emit('video:bought', this.id); // 播放页收到后重新取详情和播放地址
          setTimeout(() => uni.navigateBack(), 1000);
        } else if (r === 'cancel') this.toast('pay.cancelled');
        else if (r === 'unavailable') this.toast('pay.unavailable');
        else this.toast('video.payFail');
      } catch (e) {
        this.toast('video.payFail');
      } finally {
        this.busy = false;
      }
    },
    async onPhone(e) {
      const d = e.detail || {};
      if (!d.code) return;
      try {
        const { data } = await bindPhone(d.code);
        if (data.code !== 0) throw new Error('bind failed');
        customerState.customer = { ...(customerState.customer || {}), phone: data.data.phone };
        this.need = '';
      } catch (err) {
        this.toast('prof.phoneFail');
      }
    }
  }
};
</script>

<style lang="scss">
.page { min-height: 100vh; background: #0e1a2d; padding: 24rpx 24rpx 200rpx; box-sizing: border-box; }
.item { display: flex; margin-bottom: 24rpx; }
.thumb { position: relative; width: 240rpx; height: 135rpx; flex-shrink: 0; background: #1b2c47; border-radius: 8rpx; overflow: hidden; }
.thumb-img { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
.thumb-ph { position: absolute; left: 0; top: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; color: rgba(255, 255, 255, 0.4); font-size: 44rpx; }
.item-r { flex: 1; min-width: 0; margin-left: 24rpx; display: flex; flex-direction: column; }
.i-title { color: #fff; font-size: 34rpx; font-weight: 700; line-height: 1.4; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.i-sub { color: rgba(255, 255, 255, 0.5); font-size: 28rpx; margin-top: 10rpx; }
.card { background: rgba(255, 255, 255, 0.06); border-radius: 16rpx; padding: 8rpx 28rpx; margin-bottom: 24rpx; }
.row { display: flex; align-items: center; justify-content: space-between; padding: 24rpx 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.row.total { border-bottom: none; }
.lab { color: rgba(255, 255, 255, 0.7); font-size: 30rpx; }
.val { color: #fff; font-size: 30rpx; }
.val.cut { text-decoration: line-through; color: rgba(255, 255, 255, 0.5); }
.val.member { color: #ffb84d; }
.amount { color: #ff6b57; font-size: 44rpx; font-weight: 700; }
.notes { padding: 24rpx 28rpx; display: flex; flex-direction: column; }
.n-h { color: rgba(255, 255, 255, 0.8); font-size: 30rpx; font-weight: 600; margin-bottom: 12rpx; }
.n-t { color: rgba(255, 255, 255, 0.6); font-size: 28rpx; line-height: 1.7; }
.bar { position: fixed; left: 0; right: 0; bottom: 0; padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom)); background: #0e1a2d; border-top: 1px solid rgba(255, 255, 255, 0.08); }
.pay { height: 96rpx; line-height: 96rpx; text-align: center; border-radius: 48rpx; background: #1677ff; color: #fff; font-size: 34rpx; padding: 0; }
</style>
