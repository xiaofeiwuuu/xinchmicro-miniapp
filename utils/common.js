/**
 * 将COS格式的链接转换为TCB格式的链接
 * @param {string} cosUrl - COS格式的链接，例如：https://7072-prod-3gdwxhfn933cdfa7-1346623423.cos.ap-shanghai.myqcloud.com/web/files/1741697429500.png
 * @returns {string} - TCB格式的链接，例如：https://7072-prod-3gdwxhfn933cdfa7-1346623423.tcb.qcloud.la/web/files/1741697429500.png
 */
export const convertCosToTcbUrl = (cosUrl) => {
  if (!cosUrl) return '';
  
  // 检查是否已经是TCB格式
  if (cosUrl.includes('tcb.qcloud.la')) {
    return cosUrl;
  }
  
  // 提取环境ID和路径
  const regex = /https:\/\/([\w-]+)\.cos\.[\w-]+\.myqcloud\.com(\/.*)/;
  const match = cosUrl.match(regex);
  
  if (!match) {
    return cosUrl;
  }
  
  const envId = match[1];
  const path = match[2];
  
  // 构建TCB格式的URL
  return `https://${envId}.tcb.qcloud.la${path}`;
};

/**
 * 将TCB格式的链接转换为COS格式的链接
 * @param {string} tcbUrl - TCB格式的链接，例如：https://7072-prod-3gdwxhfn933cdfa7-1346623423.tcb.qcloud.la/web/files/1741697429500.png
 * @returns {string} - COS格式的链接，例如：https://7072-prod-3gdwxhfn933cdfa7-1346623423.cos.ap-shanghai.myqcloud.com/web/files/1741697429500.png
 */
export const convertTcbToCosUrl = (tcbUrl) => {
  if (!tcbUrl) return '';
  
  // 检查是否已经是COS格式
  if (tcbUrl.includes('cos.ap-shanghai.myqcloud.com')) {
    return tcbUrl;
  }
  
  // 提取环境ID和路径
  const regex = /https:\/\/([\w-]+)\.tcb\.qcloud\.la(\/.*)/;
  const match = tcbUrl.match(regex);
  
  if (!match) {
    return tcbUrl;
  }
  
  const envId = match[1];
  const path = match[2];
  
  // 构建COS格式的URL
  return `https://${envId}.cos.ap-shanghai.myqcloud.com${path}`;
};

/**
 * 统一处理云存储链接，确保使用TCB格式
 * @param {string} url - 任意格式的云存储链接
 * @returns {string} - TCB格式的链接
 */
export const getUnifiedCloudUrl = (url) => {
  if (!url) return '';
  
  // 如果是COS格式，转换为TCB格式
  if (url.includes('cos.ap-shanghai.myqcloud.com')) {
    return convertCosToTcbUrl(url);
  }
  
  // 已经是TCB格式或其他格式，直接返回
  return url;
}; 