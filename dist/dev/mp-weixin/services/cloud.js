"use strict";
const common_vendor = require("../common/vendor.js");
let inited = false;
function available() {
  return typeof common_vendor.wx$1 !== "undefined" && common_vendor.wx$1.cloud && common_vendor.wx$1.cloud.init;
}
function init(envId) {
  if (!available())
    return false;
  common_vendor.wx$1.cloud.init({ env: envId, traceUser: true });
  try {
    common_vendor.index.setStorageSync("cloud_env", envId);
  } catch {
  }
  inited = true;
  return true;
}
function ensure() {
  if (inited)
    return true;
  try {
    const envId = common_vendor.index.getStorageSync("cloud_env");
    if (envId)
      return init(envId);
  } catch {
  }
  return false;
}
function db() {
  if (!ensure())
    return null;
  return common_vendor.wx$1.cloud.database();
}
async function pushBackup(data) {
  const d = db();
  if (!d)
    throw new Error("unavailable");
  const col = d.collection("rtg_backup_v1");
  const payload = { type: "readytogo", version: 1, date: Date.now(), data };
  return await col.add({ data: payload });
}
async function pullLatest() {
  const d = db();
  if (!d)
    throw new Error("unavailable");
  const col = d.collection("rtg_backup_v1");
  const res = await col.orderBy("date", "desc").limit(1).get();
  if (res && res.data && res.data.length)
    return res.data[0].data;
  return null;
}
const cloud = { init, ensure, pushBackup, pullLatest };
exports.cloud = cloud;
