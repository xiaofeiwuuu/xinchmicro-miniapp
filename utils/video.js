import { getLang } from '@/utils/i18n.js';

// 播放量、购买量的显示：中文过万写「1.2万」，英文过千写「1.2k」
export function fmtCount(n) {
  n = Number(n) || 0;
  if (getLang() === 'en') return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n);
  return n >= 10000 ? (n / 10000).toFixed(1).replace(/\.0$/, '') + '万' : String(n);
}
