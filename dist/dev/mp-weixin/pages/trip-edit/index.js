"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_trip = require("../../stores/trip.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const store = stores_trip.useTripStore();
    const id = common_vendor.ref("");
    const trip = common_vendor.ref(null);
    const title = common_vendor.ref("");
    const location = common_vendor.ref("");
    const date = common_vendor.ref("");
    const time = common_vendor.ref("");
    common_vendor.onLoad((options) => {
      id.value = (options == null ? void 0 : options.id) || "";
      trip.value = store.trips.find((t) => t.id === id.value);
      if (!trip.value) {
        common_vendor.index.showToast({ title: "行程不存在", icon: "none" });
        setTimeout(() => common_vendor.index.navigateBack(), 800);
        return;
      }
      title.value = trip.value.title || "";
      location.value = trip.value.location || "";
      const parts = (trip.value.time || "").split(" ");
      date.value = parts[0] || "";
      time.value = parts[1] || "";
    });
    function onDateChange(e) {
      date.value = e.detail.value;
    }
    function onTimeChange(e) {
      time.value = e.detail.value;
    }
    function save() {
      const t = title.value.trim() || "未命名行程";
      let timeStr = "";
      if (date.value && time.value)
        timeStr = `${date.value} ${time.value}`;
      else if (date.value)
        timeStr = date.value;
      else
        timeStr = trip.value.time || "时间未设置";
      store.updateTripMeta(id.value, {
        title: t,
        location: location.value.trim(),
        time: timeStr
      });
      common_vendor.index.showToast({ title: "已保存", icon: "none" });
      setTimeout(() => common_vendor.index.navigateBack(), 500);
    }
    return (_ctx, _cache) => {
      var _a;
      return {
        a: title.value,
        b: common_vendor.o(($event) => title.value = $event.detail.value),
        c: common_vendor.t(date.value || "选择日期"),
        d: date.value,
        e: common_vendor.o(onDateChange),
        f: common_vendor.t(time.value || "选择时间"),
        g: time.value,
        h: common_vendor.o(onTimeChange),
        i: location.value,
        j: common_vendor.o(($event) => location.value = $event.detail.value),
        k: common_vendor.t(((_a = trip.value) == null ? void 0 : _a.source) || "未知"),
        l: common_vendor.o(save)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e5775869"]]);
wx.createPage(MiniProgramPage);
