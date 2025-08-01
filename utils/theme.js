// 主题管理工具

// 主题类型
const THEME_TYPES = {
  BLUE: 'blue'
};

// 默认主题
const DEFAULT_THEME = THEME_TYPES.BLUE;

/**
 * 获取当前主题
 * @returns {string} 当前主题类型
 */
export const getCurrentTheme = () => {
  return DEFAULT_THEME;
};

export default {
  THEME_TYPES,
  DEFAULT_THEME,
  getCurrentTheme
}; 