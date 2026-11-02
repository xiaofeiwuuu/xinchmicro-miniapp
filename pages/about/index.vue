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

            <view class="info-item" @tap="showLangPopup = true">
                <view class="info-left">
                    <view class="icon-box">
                        <image src="/static/icon/language.png" class="iconfont" mode="aspectFit"></image>
                    </view>
                    <view class="info-content">
                        <text class="info-label">{{ $t('about.language') }}</text>
                        <text class="info-value">{{ langLabel }}</text>
                    </view>
                </view>
            </view>

            <view class="info-item" @tap="handleClearCache">
                <view class="info-left">
                    <view class="icon-box">
                        <image src="/static/icon/clear.png" class="iconfont" mode="aspectFit"></image>
                    </view>
                    <view class="info-content">
                        <text class="info-label">{{ $t('about.clearCache') }}</text>
                        <text class="info-value">{{ cacheSize }}</text>
                    </view>
                </view>
            </view>
        </view>

        <popup-selector
            :show="showLangPopup"
            :title="$t('about.language')"
            :list="langList"
            :selectedId="lang"
            @close="showLangPopup = false"
            @select="handleSelectLang"
        />
    </view>
</template>

<script>
import shareMixin from '@/mixins/share.js';
import { getCompanyInfo } from '@/api/index.js';
import { getUnifiedCloudUrl } from '@/utils/common.js';
import PopupSelector from '@/components/PopupSelector.vue';
import { t, getLang, setLang } from '@/utils/i18n.js';
import { clearAllCache, getFileCacheInfo, formatSize, readData, writeData } from '@/utils/cache.js';

export default {
    mixins: [shareMixin],
    components: { PopupSelector },
    data() {
        return {
            companyInfo: {},
            cacheSize: '0 B',
            showLangPopup: false,
            // 语言名用各自的母语写法，不随界面语言变化
            langList: [
                { id: 'zh', name: '中文' },
                { id: 'en', name: 'English' }
            ]
        }
    },
    onShow() {
        this.refreshCacheSize();
    },
    computed: {
        lang() {
            return getLang();
        },
        langLabel() {
            const item = this.langList.find((l) => l.id === this.lang);
            return item ? item.name : '';
        }
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
        handleSelectLang(item) {
            setLang(item.id);
            this.showLangPopup = false;
        },
        async refreshCacheSize() {
            const { bytes } = await getFileCacheInfo();
            this.cacheSize = formatSize(bytes);
        },
        handleClearCache() {
            uni.showModal({
                title: t('about.clearCache'),
                content: t('about.clearConfirm'),
                confirmText: t('common.confirm'),
                cancelText: t('common.cancel'),
                success: async (res) => {
                    if (!res.confirm) return;
                    await clearAllCache();
                    await this.refreshCacheSize();
                    uni.showToast({ title: t('about.cleared'), icon: 'none' });
                    // 公司信息缓存已被清掉，重新拉取并写回
                    this.loadCompanyInfo();
                }
            });
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