<template>
	<view class="page">
		<view class="tip">临时测试页：验证小程序自带播放器能否播放腾讯云加密视频，以及录屏防护。验证完会删除。</view>
		<textarea v-model="url" class="url" placeholder="粘贴后台「视频上传测试」页生成的播放地址" :maxlength="-1" />
		<view v-if="items.length > 1" class="tiers">
			<view v-for="(it, i) in items" :key="i" :class="['tier', { on: cur === i }]" @tap="playItem(i)">{{ it.label }}</view>
		</view>
		<view class="btns">
			<view class="btn" @tap="play">播放</view>
			<view class="btn" @tap="toggleHide">{{ hideOn ? '关闭' : '开启' }}录屏黑屏</view>
			<view class="btn" @tap="clearLog">清空日志</view>
		</view>
		<view v-if="src" class="box">
			<video id="vt" :src="src" class="video" controls :autoplay="true" :show-fullscreen-btn="true" @error="onEvent('error', $event)" @waiting="onEvent('waiting')" @play="onEvent('play')" @loadedmetadata="onEvent('loadedmetadata', $event)" @ended="onEvent('ended')" />
			<view v-if="blocked" class="cover"><view class="cover-t">检测到录屏，已暂停播放</view><view class="cover-b" @tap="resume">我已停止录屏，继续观看</view></view>
			<view class="mark" :style="{ top: markTop + '%', left: markLeft + '%' }">测试用户 138****0000</view>
		</view>
		<view class="dl">
			<input v-model="dlUrl" class="dlurl" placeholder="源文件地址（mp4）" />
			<view class="btns">
				<view class="btn" @tap="chunkTest(16)">分片下载 16MB</view>
				<view class="btn" @tap="chunkTest(64)">分片下载 64MB</view>
				<view class="btn" @tap="chunkTest(0)">全部下载</view>
			</view>
		</view>
		<view class="log"><view v-for="(l, i) in logs" :key="i" class="line">{{ l }}</view></view>
	</view>
</template>

<script>
export default {
	data() {
		return { url: '', src: '', logs: [], hideOn: false, blocked: false, cur: -1, items: [], dlUrl: 'https://1346623423.vod-qcloud.com/10a82a04vodcq1346623423/7f3c93965001834828132444341/kzlAUtIALRIA.mp4', dlBusy: false, markTop: 20, markLeft: 10, timer: null };
	},
	onLoad() {
		this.add('系统：' + (uni.getSystemInfoSync ? this.sys() : ''));
		// iOS：录屏状态变化、用户截屏（iOS 不能黑屏，只能检测）
		try {
			if (wx.getScreenRecordingState) wx.getScreenRecordingState({ success: (r) => { this.add('进入时录屏状态：' + JSON.stringify(r)); if (this.isOn(r)) this.block('进入时已在录屏'); }, fail: (e) => this.add('查询录屏状态失败：' + JSON.stringify(e)) });
			else this.add('没有 getScreenRecordingState');
			if (wx.onScreenRecordingStateChanged) wx.onScreenRecordingStateChanged((r) => { this.add('录屏状态变化：' + JSON.stringify(r)); if (this.isOn(r)) this.block('开始录屏'); });
			else this.add('没有 onScreenRecordingStateChanged');
			if (wx.onUserCaptureScreen) wx.onUserCaptureScreen(() => this.add('检测到用户截屏'));
			this.setHidden(true); // 进页面就开启录屏黑屏（安卓有效），按钮可以关掉对比
		} catch (e) { this.add('注册录屏监听失败：' + e.message); }
		this.timer = setInterval(() => { this.markTop = 10 + Math.random() * 70; this.markLeft = 5 + Math.random() * 55; }, 4000); // 水印每 4 秒换位置
	},
	onUnload() {
		clearInterval(this.timer);
	},
	methods: {
		sys() {
			try { const s = wx.getDeviceInfo ? wx.getDeviceInfo() : {}; const a = wx.getAppBaseInfo ? wx.getAppBaseInfo() : {}; return `${s.platform || ''} ${s.system || ''} 基础库 ${a.SDKVersion || ''}`; } catch (e) { return ''; }
		},
		add(t) {
			const d = new Date();
			this.logs.unshift(`${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')} ${t}`);
		},
		// 微信返回的状态值文档写法不一，宽松判断：state 为 on/start/true/1 都算正在录屏
		isOn(r) {
			const s = r && (r.state !== undefined ? r.state : r.recording);
			return s === 'on' || s === 'start' || s === 'started' || s === true || s === 1;
		},
		block(why) {
			this.blocked = true;
			this.add('已暂停并遮挡：' + why);
			try { uni.createVideoContext('vt', this).pause(); } catch (e) { this.add('暂停失败：' + e.message); }
		},
		resume() {
			this.blocked = false;
			try { uni.createVideoContext('vt', this).play(); } catch (e) { this.add('继续失败：' + e.message); }
		},
		clearLog() { this.logs = []; },
		// 支持多行：每行「标签 地址」或只有地址。第一行（自动）是让播放器自己选档，其余每行是固定的一档
		parse() {
			return this.url.split('\n').map((s) => s.trim()).filter(Boolean).map((s) => {
				const m = /^(.*?)\s*(https:\/\/\S+)$/.exec(s);
				return m ? { label: m[1] || '播放', url: m[2] } : null;
			}).filter(Boolean);
		},
		play() {
			this.items = this.parse();
			if (!this.items.length) return uni.showToast({ title: '请先粘贴 https 播放地址', icon: 'none' });
			this.playItem(0);
		},
		playItem(i) {
			const it = this.items[i];
			if (!it) return;
			this.cur = i;
			this.src = '';
			this.$nextTick(() => { this.src = it.url; this.add('开始加载：' + it.label); });
		},
		onEvent(name, e) {
			const d = e && e.detail ? JSON.stringify(e.detail).slice(0, 160) : '';
			this.add(name + (d ? ' ' + d : ''));
		},
		// 分片下载：用 Range 一段一段下，每段 8MB，下完追加到一个本地文件；limitMB=0 表示下完整个文件
		chunkTest(limitMB) {
			if (this.dlBusy) return;
			const url = this.dlUrl.trim();
			if (!url) return;
			this.dlBusy = true;
			const fs = wx.getFileSystemManager();
			const target = wx.env.USER_DATA_PATH + '/chunk-test.mp4';
			try { fs.unlinkSync(target); } catch (e) { /* 没有就算了 */ }
			const CHUNK = 8 * 1024 * 1024;
			const done = (msg) => { this.dlBusy = false; this.add(msg); };
			wx.request({
				url, method: 'GET', header: { Range: 'bytes=0-0' },
				success: (r) => {
					const cr = (r.header && (r.header['Content-Range'] || r.header['content-range'])) || '';
					const total = Number((/\/(\d+)$/.exec(cr) || [])[1]);
					this.add(`探测：状态 ${r.statusCode}，Content-Range ${cr || '无'}`);
					if (r.statusCode !== 206 || !total) return done('服务器不支持分段（没返回 206），无法分片下载');
					const want = limitMB ? Math.min(total, limitMB * 1024 * 1024) : total;
					this.add(`文件 ${(total / 1048576).toFixed(0)}MB，本次下载 ${(want / 1048576).toFixed(0)}MB，每段 8MB`);
					const t0 = Date.now();
					const next = (start) => {
						if (start >= want) {
							let size = 0;
							try { size = fs.statSync(target).size; } catch (e) { /* ignore */ }
							const sec = (Date.now() - t0) / 1000;
							try { fs.unlinkSync(target); } catch (e) { /* ignore */ }
							return done(`完成：拼出 ${size} 字节（应为 ${want}），${size === want ? '大小一致' : '大小不一致！'}，用时 ${sec.toFixed(0)} 秒，平均 ${(size / 1048576 / sec).toFixed(2)}MB/s，已删除临时文件`);
						}
						const end = Math.min(start + CHUNK, want) - 1;
						const t1 = Date.now();
						wx.downloadFile({
							url, header: { Range: `bytes=${start}-${end}` },
							success: (d) => {
								if (d.statusCode !== 206) return done(`第 ${start} 段返回 ${d.statusCode}，中止`);
								try {
									const buf = fs.readFileSync(d.tempFilePath);
									if (buf.byteLength !== end - start + 1) return done(`第 ${start} 段大小 ${buf.byteLength}，应为 ${end - start + 1}，中止`);
									if (start === 0) fs.writeFileSync(target, buf); else fs.appendFileSync(target, buf);
									fs.unlinkSync(d.tempFilePath);
								} catch (e) { return done('写入失败：' + (e.errMsg || e.message)); }
								this.add(`段 ${start / CHUNK + 1} OK ${((end - start + 1) / 1048576 / ((Date.now() - t1) / 1000)).toFixed(2)}MB/s`);
								next(end + 1);
							},
							fail: (e) => done('下载失败：' + JSON.stringify(e))
						});
					};
					next(0);
				},
				fail: (e) => done('探测失败：' + JSON.stringify(e) + '（真机要在小程序后台把 vod-qcloud.com 加进 request 和 downloadFile 合法域名，或打开调试）')
			});
		},
		toggleHide() {
			this.setHidden(!this.hideOn);
		},
		setHidden(on) {
			if (!wx.setVisualEffectOnCapture) return this.add('这个版本没有 setVisualEffectOnCapture');
			wx.setVisualEffectOnCapture({
				visualEffect: on ? 'hidden' : 'none',
				success: (r) => { this.hideOn = on; this.add('录屏黑屏 ' + (on ? '已开启' : '已关闭') + ' ' + JSON.stringify(r)); },
				fail: (err) => this.add('录屏黑屏设置失败：' + JSON.stringify(err))
			});
		}
	}
};
</script>

<style>
.page { padding: 24rpx; font-size: 28rpx; }
.tip { color: #888; margin-bottom: 16rpx; }
.url { width: 100%; height: 160rpx; border: 1px solid #ddd; border-radius: 8rpx; padding: 12rpx; box-sizing: border-box; font-size: 24rpx; }
.tiers { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 16rpx; }
.tier { padding: 12rpx 24rpx; border: 1px solid #1677ff; color: #1677ff; border-radius: 8rpx; font-size: 26rpx; }
.tier.on { background: #1677ff; color: #fff; }
.btns { display: flex; gap: 16rpx; margin: 16rpx 0; }
.btn { flex: 1; text-align: center; padding: 20rpx 0; background: #1677ff; color: #fff; border-radius: 8rpx; font-size: 26rpx; }
.box { position: relative; width: 100%; height: 420rpx; background: #000; }
.video { width: 100%; height: 420rpx; }
.cover { position: absolute; left: 0; top: 0; right: 0; bottom: 0; background: #111; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; }
.cover-t { color: #fff; font-size: 30rpx; margin-bottom: 24rpx; }
.cover-b { color: #1677ff; font-size: 28rpx; padding: 12rpx 24rpx; border: 1px solid #1677ff; border-radius: 8rpx; }
.mark { position: absolute; color: rgba(255,255,255,.55); font-size: 24rpx; pointer-events: none; text-shadow: 0 0 2px rgba(0,0,0,.6); }
.dl { margin-top: 16rpx; }
.dlurl { border: 1px solid #ddd; border-radius: 8rpx; padding: 12rpx; font-size: 22rpx; }
.log { margin-top: 16rpx; font-size: 22rpx; color: #333; }
.line { padding: 4rpx 0; border-bottom: 1px dashed #eee; word-break: break-all; }
</style>
