// 天气服务 - 使用和风天气 API
// 免费版：1000次/天，需要自行申请 API Key
// 申请地址：https://www.qweather.com/

const WEATHER_API_KEY = 'YOUR_QWEATHER_KEY' // 请替换为实际的 API Key
const WEATHER_BASE_URL = 'https://devapi.qweather.com/v7'
const GEO_BASE_URL = 'https://geoapi.qweather.com/v2'

// 天气代码映射
const weatherCodeMap = {
  '100': { label: '晴', icon: 'sunny' },
  '101': { label: '多云', icon: 'cloudy' },
  '102': { label: '少云', icon: 'cloudy' },
  '103': { label: '晴间多云', icon: 'cloudy' },
  '104': { label: '阴', icon: 'overcast' },
  '200': { label: '有风', icon: 'windy' },
  '201': { label: '平静', icon: 'calm' },
  '202': { label: '微风', icon: 'breeze' },
  '203': { label: '和风', icon: 'breeze' },
  '204': { label: '清风', icon: 'breeze' },
  '205': { label: '强风', icon: 'gale' },
  '206': { label: '疾风', icon: 'gale' },
  '207': { label: '大风', icon: 'gale' },
  '208': { label: '烈风', icon: 'storm' },
  '209': { label: '风暴', icon: 'storm' },
  '210': { label: '狂暴风', icon: 'storm' },
  '211': { label: '飓风', icon: 'storm' },
  '212': { label: '龙卷风', icon: 'storm' },
  '213': { label: '热带风暴', icon: 'storm' },
  '300': { label: '阵雨', icon: 'rain' },
  '301': { label: '强阵雨', icon: 'heavy-rain' },
  '302': { label: '雷阵雨', icon: 'thunder' },
  '303': { label: '强雷阵雨', icon: 'thunder' },
  '304': { label: '雷阵雨伴有冰雹', icon: 'hail' },
  '305': { label: '小雨', icon: 'light-rain' },
  '306': { label: '中雨', icon: 'rain' },
  '307': { label: '大雨', icon: 'heavy-rain' },
  '308': { label: '极端降雨', icon: 'storm' },
  '309': { label: '毛毛雨', icon: 'drizzle' },
  '310': { label: '暴雨', icon: 'storm' },
  '311': { label: '大暴雨', icon: 'storm' },
  '312': { label: '特大暴雨', icon: 'storm' },
  '313': { label: '冻雨', icon: 'sleet' },
  '400': { label: '小雪', icon: 'light-snow' },
  '401': { label: '中雪', icon: 'snow' },
  '402': { label: '大雪', icon: 'heavy-snow' },
  '403': { label: '暴雪', icon: 'blizzard' },
  '404': { label: '雨夹雪', icon: 'sleet' },
  '405': { label: '雨雪天气', icon: 'sleet' },
  '406': { label: '阵雨夹雪', icon: 'sleet' },
  '407': { label: '阵雪', icon: 'snow' },
  '500': { label: '薄雾', icon: 'fog' },
  '501': { label: '雾', icon: 'fog' },
  '502': { label: '霾', icon: 'haze' },
  '503': { label: '扬沙', icon: 'dust' },
  '504': { label: '浮尘', icon: 'dust' },
  '507': { label: '沙尘暴', icon: 'dust-storm' },
  '508': { label: '强沙尘暴', icon: 'dust-storm' },
  '509': { label: '浓雾', icon: 'fog' },
  '510': { label: '强浓雾', icon: 'fog' },
  '511': { label: '中度霾', icon: 'haze' },
  '512': { label: '重度霾', icon: 'haze' },
  '513': { label: '严重霾', icon: 'haze' },
  '514': { label: '大雾', icon: 'fog' },
  '515': { label: '特强浓雾', icon: 'fog' },
  '800': { label: '新月', icon: 'moon' },
  '801': { label: '娥眉月', icon: 'moon' },
  '802': { label: '上弦月', icon: 'moon' },
  '803': { label: '盈凸月', icon: 'moon' },
  '804': { label: '满月', icon: 'moon' },
  '805': { label: '亏凸月', icon: 'moon' },
  '806': { label: '下弦月', icon: 'moon' },
  '807': { label: '残月', icon: 'moon' },
  '900': { label: '热', icon: 'hot' },
  '901': { label: '冷', icon: 'cold' },
  '999': { label: '未知', icon: 'unknown' },
}

/**
 * 获取用户当前位置
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02', // 国测局坐标
      success: (res) => {
        resolve({
          latitude: res.latitude,
          longitude: res.longitude
        })
      },
      fail: (err) => {
        console.error('获取位置失败:', err)
        reject(err)
      }
    })
  })
}

/**
 * 根据坐标获取城市信息
 * @param {number} longitude 经度
 * @param {number} latitude 纬度
 * @returns {Promise<{name: string, id: string}>}
 */
export async function getCityByLocation(longitude, latitude) {
  try {
    const res = await uni.request({
      url: `${GEO_BASE_URL}/city/lookup`,
      data: {
        key: WEATHER_API_KEY,
        location: `${longitude},${latitude}`,
        lang: 'zh'
      }
    })
    
    if (res.data && res.data.code === '200' && res.data.location && res.data.location.length > 0) {
      const location = res.data.location[0]
      return {
        name: location.name,
        id: location.id
      }
    }
    throw new Error('获取城市信息失败')
  } catch (error) {
    console.error('获取城市信息失败:', error)
    throw error
  }
}

/**
 * 获取实时天气
 * @param {string} cityId 城市ID
 * @returns {Promise<{code: string, label: string, temp: number, icon: string}>}
 */
export async function getCurrentWeather(cityId) {
  try {
    const res = await uni.request({
      url: `${WEATHER_BASE_URL}/weather/now`,
      data: {
        key: WEATHER_API_KEY,
        location: cityId,
        lang: 'zh'
      }
    })
    
    if (res.data && res.data.code === '200') {
      const now = res.data.now
      const weatherInfo = weatherCodeMap[now.icon] || weatherCodeMap['999']
      return {
        code: weatherInfo.icon,
        label: weatherInfo.label,
        temp: parseInt(now.temp),
        icon: now.icon
      }
    }
    throw new Error('获取天气失败')
  } catch (error) {
    console.error('获取天气失败:', error)
    throw error
  }
}

/**
 * 获取未来3天天气预报（用于显示高低温）
 * @param {string} cityId 城市ID
 * @returns {Promise<{low: number, high: number}>}
 */
export async function getDailyForecast(cityId) {
  try {
    const res = await uni.request({
      url: `${WEATHER_BASE_URL}/weather/3d`,
      data: {
        key: WEATHER_API_KEY,
        location: cityId,
        lang: 'zh'
      }
    })
    
    if (res.data && res.data.code === '200' && res.data.daily && res.data.daily.length > 0) {
      const today = res.data.daily[0]
      return {
        low: parseInt(today.tempMin),
        high: parseInt(today.tempMax),
        sunrise: today.sunrise,
        sunset: today.sunset
      }
    }
    throw new Error('获取预报失败')
  } catch (error) {
    console.error('获取预报失败:', error)
    throw error
  }
}

/**
 * 获取完整天气信息
 * @returns {Promise<{
 *   code: string, 
 *   label: string, 
 *   temp: number, 
 *   low: number, 
 *   high: number, 
 *   place: string,
 *   sunrise: string,
 *   sunset: string
 * }>}
 */
export async function getFullWeatherInfo() {
  try {
    // 1. 获取位置
    const location = await getCurrentLocation()
    
    // 2. 获取城市信息
    const city = await getCityByLocation(location.longitude, location.latitude)
    
    // 3. 并行获取实时天气和预报
    const [current, forecast] = await Promise.all([
      getCurrentWeather(city.id),
      getDailyForecast(city.id)
    ])
    
    return {
      code: current.code,
      label: current.label,
      temp: current.temp,
      low: forecast.low,
      high: forecast.high,
      place: city.name,
      sunrise: forecast.sunrise,
      sunset: forecast.sunset
    }
  } catch (error) {
    console.error('获取完整天气信息失败:', error)
    // 返回默认数据
    return {
      code: 'sunny',
      label: '晴',
      temp: 24,
      low: 13,
      high: 24,
      place: '北京',
      sunrise: '06:21',
      sunset: '18:07'
    }
  }
}

/**
 * 检查 API Key 是否已配置
 */
export function isWeatherApiConfigured() {
  return WEATHER_API_KEY !== 'YOUR_QWEATHER_KEY'
}
