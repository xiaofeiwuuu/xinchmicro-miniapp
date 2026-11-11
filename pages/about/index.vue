<template>
    <view class="container blue">
        <view class="header-card">
            <view class="company-logo">
                <image :src="getUnifiedCloudUrl(companyInfo.logoUrl) || 'https://7072-prod-3gdwxhfn933cdfa7-1346623423.tcb.qcloud.la/logo.png'" mode="aspectFit"></image>
            </view>
            <text class="company-name">{{ companyInfo.name || $t('about.defaultName') }}</text>
            <text class="company-desc">{{ companyInfo.description || $t('about.defaultDesc') }}</text>
        </view>

        <view class="info-card">
            <view class="info-item">
                <view class="info-left">
                    <view class="icon-box">
                        <image src="/static/icon/phone.png" class="iconfont"  mode="aspectFit"></image>
                    </view>
                    <view class="info-content">
                        <text class="info-label">{{ $t('about.phone') }}</text>
                        <view class="info-value">
                            <text v-if="companyInfo.contacts && companyInfo.contacts.length > 0">
                                <text v-for="(contact, index) in companyInfo.contacts" :key="index">
                                    <text @tap="handlePhone(contact)">{{ contact }}</text>
                                    <text v-if="index < companyInfo.contacts.length - 1">|</text>
                                </text>
                            </text>
                            <text v-else>
                                {{ $t('about.noPhone') }}
                            </text>
                        </view>
                    </view>
                </view>
            </view>

            <view class="info-item" @tap="handleEmail">
                <view class="info-left">
                    <view class="icon-box">
                        <image src="/static/icon/email.png" class="iconfont"  mode="aspectFit"></image>
                    </view>
                    <view class="info-content">
                        <text class="info-label">{{ $t('about.email') }}</text>
                        <text class="info-value">{{ companyInfo.email || $t('about.noEmail') }}</text>
                    </view>
                </view>
            </view>

            <view class="info-item" @tap="handleWebsite">
                <view class="info-left">
                    <view class="icon-box">
                        <image src="/static/icon/gs.png" class="iconfont"  mode="aspectFit"></image>
                    </view>
                    <view class="info-content">
                        <text class="info-label">{{ $t('about.website') }}</text>
                        <text class="info-value">{{ companyInfo.website || $t('about.noWebsite') }}</text>
                    </view>
                </view>
            </view>

            <view class="info-item" @tap="handleAddress">
                <view class="info-left">
                    <view class="icon-box">
                        <image src="/static/icon/address.png" class="iconfont"  mode="aspectFit"></image>
                    </view>
                    <view class="info-content">
                        <text class="info-label">{{ $t('about.address') }}</text>
                        <text class="info-value">{{ companyInfo.address || $t('about.noAddress') }}</text>
                    </view>
                </view>
            </view>

        </view>

        <!-- 公司位置：后台填了经纬度才显示。点这张卡片或上面的地址，打开微信地图查看位置、导航。
             这里用的是一张地图样子的图片，不用微信的 <map> 组件：<map> 是原生组件，真机上会盖在页面上面、抢走触摸，
             导致手指放在地图上时页面滚不动，也不能被页面的圆角和滚动裁剪 -->
        <view v-if="hasGeo" class="map-card" @tap="handleAddress">
            <image class="map" src="/static/map-preview.png" mode="aspectFill"></image>
            <view class="map-tip"><text>{{ $t('about.viewMap') }}</text><text class="map-tip-arrow">›</text></view>
        </view>

        <!-- 页面底部留白（有无地图都留，含 iPhone 底部横条） -->
        <view class="page-bottom"></view>
    </view>
</template>

<script>
import shareMixin from '@/mixins/share.js';
import { getCompanyInfo } from '@/api/index.js';
import { getUnifiedCloudUrl } from '@/utils/common.js';
import { t, getLang } from '@/utils/i18n.js';
import { readData, writeData } from '@/utils/cache.js';

export default {
    mixins: [shareMixin],
    data() {
        return {
            companyInfo: {}
        }
    },
    computed: {
        // 后台填了纬度和经度才显示地图
        hasGeo() {
            const c = this.companyInfo;
            return Number.isFinite(c.latitude) && Number.isFinite(c.longitude);
        },
        geo() {
            return { latitude: this.companyInfo.latitude, longitude: this.companyInfo.longitude };
        },
    },
    onLoad() {
        // 先从本地缓存获取公司信息（按语言分开存）
        const cachedCompanyInfo = readData('companyInfo');
        if (cachedCompanyInfo) {
            this.companyInfo = cachedCompanyInfo;
        }
        
        // 然后请求最新数据
        this.loadCompanyInfo();
    },
    methods: {
        getUnifiedCloudUrl,
        // 切换语言（main.js 的全局 mixin 调用）：显示新语言的缓存（没有就先清空）并重新请求
        reloadForLang() {
            this.companyInfo = readData('companyInfo') || {};
            this.loadCompanyInfo();
        },
        async loadCompanyInfo() {
            // 请求发出时的语言：响应回来时可能已经切换了语言，旧语言的结果只写进旧语言的缓存
            const lang = getLang();
            try {
                const { data } = await getCompanyInfo();
                if (data.code === 0) {
                    writeData('companyInfo', data.data, lang);
                    if (lang === getLang()) this.companyInfo = data.data;
                } else {
                    // 保留本地缓存的公司信息
                }
            } catch (e) {
                // 保留本地缓存的公司信息
            }
        },
        handlePhone(number) {
            uni.makePhoneCall({
                phoneNumber: number,
                fail(err) {
                    // 用户取消拨号也会进入这里，无需提示
                }
            });
        },
        handleEmail() {
            uni.setClipboardData({
                data: this.companyInfo.email || 'sales@xcanalog.com',
                success: () => {
                    uni.showToast({
                        title: t('about.emailCopied'),
                        icon: 'none'
                    });
                }
            });
        },
        handleWebsite() {
            uni.setClipboardData({
                data: this.companyInfo.website || 'http://www.xcanalog.com',
                success: () => {
                    uni.showToast({
                        title: t('about.websiteCopied'),
                        icon: 'none'
                    });
                }
            });
        },
        handleAddress() {
            if (this.hasGeo) {
                // 微信自带的地图页：看位置、导航、复制地址
                uni.openLocation({
                    latitude: this.geo.latitude,
                    longitude: this.geo.longitude,
                    name: this.companyInfo.name || '',
                    address: this.companyInfo.address || '',
                    scale: 16,
                    fail() {}
                });
                return;
            }
            uni.setClipboardData({
                data: this.companyInfo.address || t('about.defaultAddress'),
                success: () => {
                    uni.showToast({
                        title: t('about.addressCopied'),
                        icon: 'none'
                    });
                }
            });
        }
    }
}
</script>

<style lang="scss">
@import '@/common/style/common.scss';

.container {
    @include page-container;
    box-sizing: border-box;
    padding: 0;
    
    &.blue {
        .company-name {
            color: #FFFFFF;
            text-shadow: 0 2rpx 4rpx rgba(0, 119, 255, 0.2);
        }
        
        .company-desc {
            color: rgba(255, 255, 255, 0.9);
        }
    }
    
    .header-card {
        padding: 60rpx 40rpx;
        background: transparent;
        border: none;
        text-align: center;
        box-sizing: border-box;

        .company-logo {
            width: 160rpx;
            height: 160rpx;
            margin: 0rpx auto 40rpx;
            border-radius: 40rpx;
            padding: 20rpx;
            // backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);

            image {
                width: 100%;
                height: 100%;
            }
        }

        .company-name {
            font-size: 40rpx;
            font-weight: bold;
            margin-bottom: 16rpx;
            display: block;
            color: #FFFFFF;
            text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
        }

        .company-desc {
            font-size: 28rpx;
            color: rgba(255, 255, 255, 0.9);
        }
    }

    .page-bottom {
        height: calc(20rpx + constant(safe-area-inset-bottom));
        height: calc(20rpx + env(safe-area-inset-bottom));
    }

    .map-card {
        margin: 20rpx 20rpx 0;
        border-radius: 16rpx;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.06);

        position: relative;

        .map {
            display: block;
            width: 100%;
            height: 300rpx;
        }

        // 图片下沿的提示条：点了打开微信地图
        .map-tip {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 72rpx;
            background: linear-gradient(to top, rgba(8, 18, 36, 0.85), rgba(8, 18, 36, 0));
            color: #fff;
            font-size: 26rpx;

            .map-tip-arrow {
                margin-left: 8rpx;
                font-size: 32rpx;
                opacity: 0.8;
            }
        }
    }

    .info-card {
        // @include card;
        margin: 0rpx 20rpx;

        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 30rpx;
            border-bottom: 1px solid $border-color;
            transition: background-color 0.3s ease;

            &:last-child {
                border-bottom: none;
            }

            &:active {
                background-color: $hover-color;
            }

            .info-left {
                display: flex;
                align-items: center;
                flex: 1;
                min-width: 0;

                .icon-box {
                    @include icon-base;
                    flex-shrink: 0; // 地址这类长文字换行时，图标不被挤扁

                    .iconfont {
                        width: 48rpx;
                        height: 48rpx;
                    }

                    &.icon-phone {
                        background: rgba(#00A8FF, 0.1);
                    }

                    &.icon-email {
                        background: rgba(#00BFA6, 0.1);
                    }

                    &.icon-website {
                        background: rgba(#7367F0, 0.1);
                    }

                    &.icon-location {
                        background: rgba(#FF9F43, 0.1);
                    }
                }

                .info-content {
                    flex: 1;
                    min-width: 0;

                    .info-label {
                        font-size: 24rpx;
                        color: $text-secondary;
                        margin-bottom: 8rpx;
                        display: block;
                    }

                    .info-value {
                        font-size: 28rpx;
                        color: $text-primary;
                        word-break: break-all; // 网址、英文地址太长时换行，不撑开一行
                    }
                }
            }

            .action-button {
                background: rgba($primary-color, 0.1);
                padding: 12rpx 24rpx;
                border-radius: 30rpx;
                border: 1px solid rgba($primary-color, 0.2);

                text {
                    font-size: 26rpx;
                    color: $primary-color;
                }
            }
        }
    }
}
</style>