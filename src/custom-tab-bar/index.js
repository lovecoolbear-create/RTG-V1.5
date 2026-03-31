const THEME_STORAGE_KEY = 'rtg_auto_theme_mode'

function detectThemeModeByHour() {
  const hour = new Date().getHours()
  return hour >= 7 && hour < 19 ? 'day' : 'night'
}

function readThemeMode() {
  const cached = String(wx.getStorageSync(THEME_STORAGE_KEY) || '').trim()
  if (cached === 'day' || cached === 'night') return cached
  const mode = detectThemeModeByHour()
  wx.setStorageSync(THEME_STORAGE_KEY, mode)
  return mode
}

Component({
  data: {
    selected: 0,
    themeClass: 'theme-night',
    list: [
      { pagePath: 'pages/tab-home/index', text: '日历' },
      { pagePath: 'pages/tab-gear/index', text: '装备库' },
      { pagePath: 'pages/tab-templates/index', text: '模板库' },
      { pagePath: 'pages/tab-history/index', text: '历史' },
      { pagePath: 'pages/tab-settings/index', text: '设置' },
    ]
  },
  
  attached() {
    this.updateTheme()
  },
  
  methods: {
    updateTheme() {
      const mode = readThemeMode()
      this.setData({
        themeClass: mode === 'day' ? 'theme-day' : 'theme-night'
      })
    },
    
    switchTab(e) {
      const index = e.currentTarget.dataset.index
      const url = '/' + this.data.list[index].pagePath
      wx.switchTab({ url })
      this.setData({ selected: index })
    }
  }
})
