/**
 * 国际化(i18n)支持
 * 多语言管理系统
 */

// 语言包定义
const messages = {
  // 简体中文
  'zh-CN': {
    // 通用
    common: {
      confirm: '确认',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      create: '创建',
      search: '搜索',
      loading: '加载中...',
      empty: '暂无数据',
      error: '出错了',
      retry: '重试',
      close: '关闭',
      back: '返回',
      more: '更多',
      less: '收起'
    },
    
    // 首页
    home: {
      title: 'ReadyToGo',
      greeting: '你好',
      today: '今天',
      calendar: '日历',
      weather: '天气',
      recommendations: '为你推荐',
      ongoing: '进行中',
      toArchive: '待归档',
      quickCreate: '快速创建',
      noTrips: '暂无行程',
      createFirst: '创建你的第一个行程'
    },
    
    // 清单页
    checklist: {
      title: '行程清单',
      departure: '出发清点',
      return: '返程清点',
      progress: '进度',
      packed: '已打包',
      total: '总计',
      addItem: '添加物品',
      fromGear: '从装备库添加',
      checkAll: '全部勾选',
      uncheckAll: '全部取消',
      saveAsTemplate: '另存为模板',
      share: '分享',
      recoveryRate: '找回率'
    },
    
    // 装备库
    gear: {
      title: '装备库',
      addGear: '添加装备',
      editGear: '编辑装备',
      category: '分类',
      weight: '重量',
      important: '重要物品',
      consumable: '消耗品',
      restockAlert: '补货提醒',
      noGear: '暂无装备',
      searchPlaceholder: '搜索装备...'
    },
    
    // 模板
    templates: {
      title: '模板库',
      myTemplates: '我的模板',
      presetTemplates: '预设模板',
      community: '社区模板',
      createTemplate: '创建模板',
      editTemplate: '编辑模板',
      import: '导入',
      export: '导出',
      share: '分享',
      noTemplates: '暂无模板'
    },
    
    // 历史
    history: {
      title: '历史行程',
      archive: '归档',
      stats: '统计',
      recoveryRate: '找回率',
      totalTrips: '总行程数',
      mostUsedTemplate: '最常用模板',
      avgItems: '平均物品数',
      frequentItems: '常用物品',
      noHistory: '暂无历史记录'
    },
    
    // 设置
    settings: {
      title: '设置',
      data: '数据管理',
      backup: '备份数据',
      restore: '恢复数据',
      autoBackup: '自动备份',
      cloudSync: '云同步',
      deviceSync: '设备间同步',
      rules: '校验规则',
      theme: '主题',
      darkMode: '深色模式',
      lightMode: '浅色模式',
      about: '关于',
      privacy: '隐私政策',
      terms: '用户协议'
    }
  },
  
  // 繁体中文
  'zh-TW': {
    common: {
      confirm: '確認',
      cancel: '取消',
      save: '儲存',
      delete: '刪除',
      edit: '編輯',
      create: '創建',
      search: '搜尋',
      loading: '載入中...',
      empty: '暫無資料',
      error: '出錯了',
      retry: '重試',
      close: '關閉',
      back: '返回',
      more: '更多',
      less: '收起'
    },
    home: {
      title: 'ReadyToGo',
      greeting: '你好',
      today: '今天',
      calendar: '日曆',
      weather: '天氣',
      recommendations: '為你推薦',
      ongoing: '進行中',
      toArchive: '待歸檔',
      quickCreate: '快速創建',
      noTrips: '暫無行程',
      createFirst: '創建你的第一個行程'
    },
    checklist: {
      title: '行程清單',
      departure: '出發清點',
      return: '返程清點',
      progress: '進度',
      packed: '已打包',
      total: '總計',
      addItem: '添加物品',
      fromGear: '從裝備庫添加',
      checkAll: '全部勾選',
      uncheckAll: '全部取消',
      saveAsTemplate: '另存為模板',
      share: '分享',
      recoveryRate: '找回率'
    },
    gear: {
      title: '裝備庫',
      addGear: '添加裝備',
      editGear: '編輯裝備',
      category: '分類',
      weight: '重量',
      important: '重要物品',
      consumable: '消耗品',
      restockAlert: '補貨提醒',
      noGear: '暫無裝備',
      searchPlaceholder: '搜尋裝備...'
    },
    templates: {
      title: '模板庫',
      myTemplates: '我的模板',
      presetTemplates: '預設模板',
      community: '社區模板',
      createTemplate: '創建模板',
      editTemplate: '編輯模板',
      import: '導入',
      export: '導出',
      share: '分享',
      noTemplates: '暫無模板'
    },
    history: {
      title: '歷史行程',
      archive: '歸檔',
      stats: '統計',
      recoveryRate: '找回率',
      totalTrips: '總行程數',
      mostUsedTemplate: '最常用模板',
      avgItems: '平均物品數',
      frequentItems: '常用物品',
      noHistory: '暫無歷史記錄'
    },
    settings: {
      title: '設置',
      data: '資料管理',
      backup: '備份資料',
      restore: '恢復資料',
      autoBackup: '自動備份',
      cloudSync: '雲同步',
      deviceSync: '設備間同步',
      rules: '校驗規則',
      theme: '主題',
      darkMode: '深色模式',
      lightMode: '淺色模式',
      about: '關於',
      privacy: '隱私政策',
      terms: '用戶協議'
    }
  },
  
  // English
  'en': {
    common: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      loading: 'Loading...',
      empty: 'No data',
      error: 'Error occurred',
      retry: 'Retry',
      close: 'Close',
      back: 'Back',
      more: 'More',
      less: 'Less'
    },
    home: {
      title: 'ReadyToGo',
      greeting: 'Hello',
      today: 'Today',
      calendar: 'Calendar',
      weather: 'Weather',
      recommendations: 'Recommended for you',
      ongoing: 'In Progress',
      toArchive: 'To Archive',
      quickCreate: 'Quick Create',
      noTrips: 'No trips yet',
      createFirst: 'Create your first trip'
    },
    checklist: {
      title: 'Trip Checklist',
      departure: 'Departure Check',
      return: 'Return Check',
      progress: 'Progress',
      packed: 'Packed',
      total: 'Total',
      addItem: 'Add Item',
      fromGear: 'Add from Gear Library',
      checkAll: 'Check All',
      uncheckAll: 'Uncheck All',
      saveAsTemplate: 'Save as Template',
      share: 'Share',
      recoveryRate: 'Recovery Rate'
    },
    gear: {
      title: 'Gear Library',
      addGear: 'Add Gear',
      editGear: 'Edit Gear',
      category: 'Category',
      weight: 'Weight',
      important: 'Important',
      consumable: 'Consumable',
      restockAlert: 'Restock Alert',
      noGear: 'No gear yet',
      searchPlaceholder: 'Search gear...'
    },
    templates: {
      title: 'Templates',
      myTemplates: 'My Templates',
      presetTemplates: 'Preset Templates',
      community: 'Community',
      createTemplate: 'Create Template',
      editTemplate: 'Edit Template',
      import: 'Import',
      export: 'Export',
      share: 'Share',
      noTemplates: 'No templates yet'
    },
    history: {
      title: 'Trip History',
      archive: 'Archive',
      stats: 'Statistics',
      recoveryRate: 'Recovery Rate',
      totalTrips: 'Total Trips',
      mostUsedTemplate: 'Most Used Template',
      avgItems: 'Avg Items',
      frequentItems: 'Frequent Items',
      noHistory: 'No history yet'
    },
    settings: {
      title: 'Settings',
      data: 'Data Management',
      backup: 'Backup',
      restore: 'Restore',
      autoBackup: 'Auto Backup',
      cloudSync: 'Cloud Sync',
      deviceSync: 'Device Sync',
      rules: 'Validation Rules',
      theme: 'Theme',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      about: 'About',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service'
    }
  },
  
  // Japanese
  'ja': {
    common: {
      confirm: '確認',
      cancel: 'キャンセル',
      save: '保存',
      delete: '削除',
      edit: '編集',
      create: '作成',
      search: '検索',
      loading: '読み込み中...',
      empty: 'データなし',
      error: 'エラーが発生しました',
      retry: '再試行',
      close: '閉じる',
      back: '戻る',
      more: 'もっと見る',
      less: '折りたたむ'
    },
    home: {
      title: 'ReadyToGo',
      greeting: 'こんにちは',
      today: '今日',
      calendar: 'カレンダー',
      weather: '天気',
      recommendations: 'おすすめ',
      ongoing: '進行中',
      toArchive: 'アーカイブ予定',
      quickCreate: 'クイック作成',
      noTrips: '旅行がありません',
      createFirst: '最初の旅行を作成'
    },
    checklist: {
      title: '持ち物リスト',
      departure: '出発前チェック',
      return: '帰宅時チェック',
      progress: '進捗',
      packed: '準備完了',
      total: '合計',
      addItem: 'アイテム追加',
      fromGear: '装備ライブラリから追加',
      checkAll: '全てチェック',
      uncheckAll: '全て未チェック',
      saveAsTemplate: 'テンプレートとして保存',
      share: '共有',
      recoveryRate: '回収率'
    },
    gear: {
      title: '装備ライブラリ',
      addGear: '装備追加',
      editGear: '装備編集',
      category: 'カテゴリー',
      weight: '重量',
      important: '重要アイテム',
      consumable: '消耗品',
      restockAlert: '補充リマインダー',
      noGear: '装備がありません',
      searchPlaceholder: '装備を検索...'
    },
    templates: {
      title: 'テンプレート',
      myTemplates: 'マイテンプレート',
      presetTemplates: 'プリセットテンプレート',
      community: 'コミュニティ',
      createTemplate: 'テンプレート作成',
      editTemplate: 'テンプレート編集',
      import: 'インポート',
      export: 'エクスポート',
      share: '共有',
      noTemplates: 'テンプレートがありません'
    },
    history: {
      title: '旅行履歴',
      archive: 'アーカイブ',
      stats: '統計',
      recoveryRate: '回収率',
      totalTrips: '総旅行数',
      mostUsedTemplate: '最も使用したテンプレート',
      avgItems: '平均アイテム数',
      frequentItems: '頻出アイテム',
      noHistory: '履歴がありません'
    },
    settings: {
      title: '設定',
      data: 'データ管理',
      backup: 'バックアップ',
      restore: 'リストア',
      autoBackup: '自動バックアップ',
      cloudSync: 'クラウド同期',
      deviceSync: 'デバイス同期',
      rules: '検証ルール',
      theme: 'テーマ',
      darkMode: 'ダークモード',
      lightMode: 'ライトモード',
      about: 'について',
      privacy: 'プライバシーポリシー',
      terms: '利用規約'
    }
  }
}

// 当前语言
let currentLocale = 'zh-CN'

// 存储键
const LOCALE_STORAGE_KEY = 'rtg_locale'

/**
 * 获取存储的语言设置
 */
function getStoredLocale() {
  try {
    return uni.getStorageSync(LOCALE_STORAGE_KEY) || 'zh-CN'
  } catch {
    return 'zh-CN'
  }
}

/**
 * 保存语言设置
 */
function setStoredLocale(locale) {
  try {
    uni.setStorageSync(LOCALE_STORAGE_KEY, locale)
  } catch (e) {
    console.error('Failed to save locale:', e)
  }
}

/**
 * 获取系统语言
 */
function getSystemLocale() {
  const systemInfo = uni.getSystemInfoSync()
  const language = systemInfo.language || 'zh-CN'
  
  // 映射到支持的语言
  if (language.startsWith('zh')) {
    return language.includes('TW') || language.includes('HK') ? 'zh-TW' : 'zh-CN'
  }
  if (language.startsWith('en')) return 'en'
  if (language.startsWith('ja')) return 'ja'
  
  return 'zh-CN'
}

/**
 * 初始化语言设置
 */
export function initI18n() {
  const stored = getStoredLocale()
  const system = getSystemLocale()
  currentLocale = stored || system
  
  console.log('[i18n] Current locale:', currentLocale)
}

/**
 * 设置当前语言
 * @param {string} locale - 语言代码
 */
export function setLocale(locale) {
  if (!messages[locale]) {
    console.warn(`[i18n] Locale ${locale} not supported`)
    return false
  }
  
  currentLocale = locale
  setStoredLocale(locale)
  
  // 触发语言变更事件
  uni.$emit('localeChange', locale)
  
  return true
}

/**
 * 获取当前语言
 */
export function getLocale() {
  return currentLocale
}

/**
 * 获取支持的语言列表
 */
export function getSupportedLocales() {
  return [
    { code: 'zh-CN', name: '简体中文' },
    { code: 'zh-TW', name: '繁體中文' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' }
  ]
}

/**
 * 翻译函数
 * @param {string} key - 翻译键（支持点号路径，如 'home.title'）
 * @param {Object} params - 插值参数
 * @returns {string}
 */
export function t(key, params = {}) {
  const keys = key.split('.')
  let value = messages[currentLocale]
  
  for (const k of keys) {
    value = value?.[k]
    if (!value) break
  }
  
  // 如果当前语言没有，尝试使用英文，最后使用中文
  if (!value && currentLocale !== 'en') {
    value = messages['en']
    for (const k of keys) {
      value = value?.[k]
      if (!value) break
    }
  }
  
  if (!value && currentLocale !== 'zh-CN') {
    value = messages['zh-CN']
    for (const k of keys) {
      value = value?.[k]
      if (!value) break
    }
  }
  
  if (!value) {
    console.warn(`[i18n] Missing translation for key: ${key}`)
    return key
  }
  
  // 处理插值
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match
    })
  }
  
  return value
}

/**
 * 批量翻译
 * @param {string[]} keys - 翻译键数组
 * @returns {Object}
 */
export function translateBatch(keys) {
  const result = {}
  keys.forEach(key => {
    result[key] = t(key)
  })
  return result
}

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期
 * @param {string} format - 格式
 */
export function formatDate(date, format = 'full') {
  const d = new Date(date)
  const locales = {
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    'en': 'en-US',
    'ja': 'ja-JP'
  }
  
  const options = {
    short: { month: 'short', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    full: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
  }
  
  return d.toLocaleDateString(locales[currentLocale], options[format] || options.full)
}

/**
 * 格式化数字
 * @param {number} num - 数字
 * @param {Object} options - 选项
 */
export function formatNumber(num, options = {}) {
  const { decimals = 0, percent = false } = options
  
  if (percent) {
    return (num * 100).toFixed(decimals) + '%'
  }
  
  return num.toLocaleString(currentLocale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

// 默认导出
export default {
  init: initI18n,
  setLocale,
  getLocale,
  getSupportedLocales,
  t,
  translateBatch,
  formatDate,
  formatNumber
}
