// 下载并打开电子发票：PDF 用文档查看器打开（可转发、保存）；图片（JPG、PNG）用图片预览（长按可保存到相册）。
// 不读文件缓存：财务可能替换了发票文件，每次都向服务端要一个新的临时链接再下载，下载到的就是最新的。
// 返回 'ok' 打开成功 / 'fail' 失败
import { getInvoiceFile } from '@/api/shop.js';
import { downloadDoc, openDoc } from '@/utils/documents.js';
import { logError } from '@/utils/logger.js';
import { t } from '@/utils/i18n.js';

const IMAGE_EXT = /\.(jpe?g|png)(\?|$)/i;

// 下载图片到临时文件再预览。直接把带签名的网络地址交给预览也行，但下载后长按保存更稳
function previewImageFile(url) {
  return new Promise((resolve, reject) => {
    uni.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode !== 200 || !res.tempFilePath) return reject(new Error('download status ' + res.statusCode));
        uni.hideLoading(); // 下载完了，马上要打开预览，去掉「正在下载」
        uni.previewImage({
          urls: [res.tempFilePath],
          current: res.tempFilePath,
          success: () => resolve(),
          fail: (e) => reject(e)
        });
      },
      fail: (e) => reject(e)
    });
  });
}

export async function openInvoiceFile(orderId) {
  // 点了「下载发票」要让人看到在下载：全屏的「正在下载发票…」提示（遮罩挡住别的点击），下载完成、打开之前去掉
  uni.showLoading({ title: t('inv.downloadingDoc'), mask: true });
  try {
    const { data } = await getInvoiceFile(orderId);
    if (data.code !== 0) throw new Error(data.message || 'no invoice file');
    const { url, name } = data.data;
    // 按文件名判断是不是图片，文件名没有扩展名时再看链接路径
    if (IMAGE_EXT.test(name || '') || IMAGE_EXT.test(String(url).split('?')[0])) {
      await previewImageFile(url);
      return 'ok';
    }
    // 下载链接带签名，不要记进日志
    const path = await downloadDoc({ url, name: 'invoice-' + orderId, fileId: 'invoice:' + orderId });
    uni.hideLoading();
    await openDoc(path);
    return 'ok';
  } catch (e) {
    logError('invoice.file', { error: (e && (e.errMsg || e.message)) || String(e) });
    return 'fail';
  } finally {
    uni.hideLoading(); // 不管成功失败，提示一定要去掉（重复调用没有影响）
  }
}
