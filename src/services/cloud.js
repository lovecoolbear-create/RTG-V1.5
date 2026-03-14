let inited = false

function available() {
  return typeof wx !== 'undefined' && wx.cloud && wx.cloud.init
}

export function init(envId) {
  if (!available()) return false
  wx.cloud.init({ env: envId, traceUser: true })
  try {
    uni.setStorageSync('cloud_env', envId)
  } catch {}
  inited = true
  return true
}

export function ensure() {
  if (inited) return true
  try {
    const envId = uni.getStorageSync('cloud_env')
    if (envId) return init(envId)
  } catch {}
  return false
}

function db() {
  if (!ensure()) return null
  return wx.cloud.database()
}

export async function pushBackup(data) {
  const d = db()
  if (!d) throw new Error('unavailable')
  const col = d.collection('rtg_backup_v1')
  const payload = { type: 'readytogo', version: 1, date: Date.now(), data }
  return await col.add({ data: payload })
}

export async function pullLatest() {
  const d = db()
  if (!d) throw new Error('unavailable')
  const col = d.collection('rtg_backup_v1')
  const res = await col.orderBy('date', 'desc').limit(1).get()
  if (res && res.data && res.data.length) return res.data[0].data
  return null
}

export default { init, ensure, pushBackup, pullLatest }
