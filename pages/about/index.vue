<template>
    <view class="container blue">
        <view class="header-card">
            <view class="company-logo">
                <image :src="getUnifiedCloudUrl(companyInfo.logoUrl) || 'https://7072-prod-3gdwxhfn933cdfa7-1346623423.tcb.qcloud.la/logo.png'" mode="aspectFit"></image>
            </view>
            <text class="company-name">{{ companyInfo.name || '芯辰微' }}</text>
            <text class="company-desc">{{ companyInfo.description || '厦门芯辰微电子有限公司成立于2020年，总公司位于厦门，在石家庄、成都设有分公司' }}</text>
        </view>

        <view class="info-card">
            <view class="info-item">
                <view class="info-left">
                    <view class="icon-box">
                        <image src="/static/icon/phone.png" class="iconfont"  mode="aspectFit"></image>
                    </view>
                    <view class="info-content">
                        <text class="info-label">联系电话</text>
                        <view class="info-value">
                            <text v-if="companyInfo.contacts && companyInfo.contacts.length > 0">
                                <text v-for="(contact, index) in companyInfo.contacts" :key="index">
                                    <text @tap="handlePhone(contact)">{{ contact }}</text>
                                    <text v-if="index < companyInfo.contacts.length - 1">|</text>
                                </text>
                            </text>
                            <text v-else>
                                暂无联系方式
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
                        <text class="info-label">电子邮箱</text>
                        <text class="info-value">{{ companyInfo.email || '暂无邮箱' }}</text>
                    </view>
                </view>
            </view>

            <view class="info-item" @tap="handleWebsite">
                <view class="info-left">
                    <view class="icon-box">
                        <image src="/static/icon/gs.png" class="iconfont"  mode="aspectFit"></image>
                    </view>
                    <view class="info-content">
                        <text class="info-label">官方网站</text>
                        <text class="info-value">{{ companyInfo.website || '暂无网站' }}</text>
                    </view>
                </view>
            </view>

            <view class="info-item" @tap="handleAddress">
                <view class="info-left">
                    <view class="icon-box">
                        <image src="/static/icon/address.png" class="iconfont"  mode="aspectFit"></image>
                    </view>
                    <view class="info-content">
                        <text class="info-label">公司地址</text>
                        <text class="info-value">{{ companyInfo.address || '暂无地址' }}</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import shareMixin from '@/mixins/share.js';
import { getCompanyInfo } from '@/api/index.js';
import { getUnifiedCloudUrl } from '@/utils/common.js';

export default {
    mixins: [shareMixin],
    data() {
        return {
            companyInfo: {}
        }
    },
    onLoad() {
        // 先从本地缓存获取公司信息
        const cachedCompanyInfo = uni.getStorageSync('companyInfo');
        if (cachedCompanyInfo) {
            this.companyInfo = cachedCompanyInfo;
        }
        
        // 然后请求最新数据
        this.loadCompanyInfo();
    },
    methods: {
        getUnifiedCloudUrl,
        async loadCompanyInfo() {
            try {
                const { data } = await getCompanyInfo();
                if (data.code === 0) {
                    this.companyInfo = data.data;
                    // 更新本地缓存
                    uni.setStorageSync('companyInfo', this.companyInfo);
                } else {
                    console.error('获取公司信息失败', data);
                }
            } catch (e) {
                console.error('获取公司信息异常', e);
            }
        },
        handlePhone(number) {
            uni.makePhoneCall({
                phoneNumber: number,
                fail(err) {
                    console.error('拨打电话失败', err);
                }
            });
        },
        handleEmail() {
            uni.setClipboardData({
                data: this.companyInfo.email || 'sales@xcanalog.com',
                success: () => {
                    uni.showToast({
                        title: '邮箱已复制',
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
                        title: '网址复制成功',
                        icon: 'none'
                    });
                }
            });
        },
        handleAddress() {
            uni.setClipboardData({
                data: this.companyInfo.address || '中国（福建）自由贸易试验区厦门片区港中路1694号',
                success: () => {
                    uni.showToast({
                        title: '地址已复制',
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

                .icon-box {
                    @include icon-base;

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
                    .info-label {
                        font-size: 24rpx;
                        color: $text-secondary;
                        margin-bottom: 8rpx;
                        display: block;
                    }

                    .info-value {
                        font-size: 28rpx;
                        color: $text-primary;
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