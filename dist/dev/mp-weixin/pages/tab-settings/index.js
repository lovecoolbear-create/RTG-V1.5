"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_trip = require("../../stores/trip.js");
const stores_templates = require("../../stores/templates.js");
const stores_gear = require("../../stores/gear.js");
const services_cloud = require("../../services/cloud.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const tripStore = stores_trip.useTripStore();
    const tplStore = stores_templates.useTemplateStore();
    const gearStore = stores_gear.useGearStore();
    const envId = common_vendor.ref("");
    try {
      envId.value = common_vendor.index.getStorageSync("cloud_env") || "";
    } catch {
    }
    function doExport() {
      const data = {
        version: 1,
        date: Date.now(),
        trips: tripStore.exportData(),
        templates: tplStore.exportData(),
        gear: gearStore.exportData()
      };
      const json = JSON.stringify(data);
      common_vendor.index.setClipboardData({
        data: json,
        success: () => {
          common_vendor.index.showToast({ title: "已复制备份数据", icon: "success" });
        }
      });
    }
    function doImport() {
      common_vendor.index.showModal({
        title: "恢复数据",
        content: "这将覆盖当前所有数据，且不可撤销。请确保剪贴板中已复制了有效的备份 JSON。确定要继续吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.getClipboardData({
              success: (clip) => {
                try {
                  if (!clip.data)
                    throw new Error("剪贴板为空");
                  const data = JSON.parse(clip.data);
                  if (data.trips)
                    tripStore.importData(data.trips);
                  if (data.templates)
                    tplStore.importData(data.templates);
                  if (data.gear)
                    gearStore.importData(data.gear);
                  common_vendor.index.showToast({ title: "恢复成功", icon: "success" });
                } catch (e) {
                  common_vendor.index.showToast({ title: "数据格式错误", icon: "none" });
                }
              }
            });
          }
        }
      });
    }
    function connectCloud() {
      if (!envId.value) {
        common_vendor.index.showToast({ title: "请输入环境ID", icon: "none" });
        return;
      }
      const ok = services_cloud.cloud.init(envId.value);
      if (ok)
        common_vendor.index.showToast({ title: "已连接", icon: "success" });
      else
        common_vendor.index.showToast({ title: "仅在微信内可用", icon: "none" });
    }
    function cloudUpload() {
      if (!services_cloud.cloud.ensure()) {
        connectCloud();
        if (!services_cloud.cloud.ensure())
          return;
      }
      const data = {
        version: 1,
        date: Date.now(),
        trips: tripStore.exportData(),
        templates: tplStore.exportData(),
        gear: gearStore.exportData()
      };
      services_cloud.cloud.pushBackup(data).then(() => {
        common_vendor.index.showToast({ title: "已上传", icon: "success" });
      }).catch(() => {
        common_vendor.index.showToast({ title: "上传失败", icon: "none" });
      });
    }
    function cloudDownload() {
      if (!services_cloud.cloud.ensure()) {
        connectCloud();
        if (!services_cloud.cloud.ensure())
          return;
      }
      services_cloud.cloud.pullLatest().then((data) => {
        if (!data) {
          common_vendor.index.showToast({ title: "暂无云端数据", icon: "none" });
          return;
        }
        if (data.trips)
          tripStore.importData(data.trips);
        if (data.templates)
          tplStore.importData(data.templates);
        if (data.gear)
          gearStore.importData(data.gear);
        common_vendor.index.showToast({ title: "拉取成功", icon: "success" });
      }).catch(() => {
        common_vendor.index.showToast({ title: "拉取失败", icon: "none" });
      });
    }
    return (_ctx, _cache) => {
      return {
        a: envId.value,
        b: common_vendor.o(($event) => envId.value = $event.detail.value),
        c: common_vendor.o(connectCloud),
        d: common_vendor.o(cloudUpload),
        e: common_vendor.o(cloudDownload),
        f: common_vendor.o(doExport),
        g: common_vendor.o(doImport)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a83dc1a1"]]);
wx.createPage(MiniProgramPage);
