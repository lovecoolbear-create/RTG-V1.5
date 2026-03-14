"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_trip = require("../../stores/trip.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const tripId = common_vendor.ref("");
    const store = stores_trip.useTripStore();
    const trip = common_vendor.ref(null);
    const returning = common_vendor.ref([]);
    common_vendor.onLoad((options) => {
      tripId.value = (options == null ? void 0 : options.id) || "";
      const found = store.trips.find((t) => t.id === tripId.value);
      if (found) {
        trip.value = found;
        returning.value = store.itemsOf(tripId.value, true).filter((i) => i.isChecked);
      }
    });
    const itemsByGroup = common_vendor.computed(() => {
      const map = {};
      for (const it of returning.value) {
        const g = it.group || "其他";
        if (!map[g])
          map[g] = [];
        map[g].push(it);
      }
      return map;
    });
    const groups = common_vendor.computed(() => Object.keys(itemsByGroup.value));
    const depExpected = common_vendor.computed(() => {
      if (!tripId.value)
        return [];
      const dep = store.itemsOf(tripId.value, false);
      return dep.filter((i) => i.isChecked && !i.isConsumable);
    });
    const retSet = common_vendor.computed(() => {
      if (!tripId.value)
        return /* @__PURE__ */ new Set();
      const ret = store.itemsOf(tripId.value, true);
      const list = ret.filter((i) => i.isChecked);
      const set = /* @__PURE__ */ new Set();
      for (const it of list) {
        set.add(`${it.name}|${it.group || "其他"}`);
      }
      return set;
    });
    const groupStats = common_vendor.computed(() => {
      const map = {};
      for (const it of depExpected.value) {
        const g = it.group || "其他";
        if (!map[g])
          map[g] = { group: g, expected: 0, returned: 0, missed: 0 };
        map[g].expected++;
        if (retSet.value.has(`${it.name}|${g}`)) {
          map[g].returned++;
        }
      }
      for (const k in map) {
        map[k].missed = map[k].expected - map[k].returned;
      }
      return Object.values(map);
    });
    const missedList = common_vendor.computed(() => {
      return depExpected.value.filter((it) => !retSet.value.has(`${it.name}|${it.group || "其他"}`));
    });
    const missedByGroup = common_vendor.computed(() => {
      const map = {};
      for (const it of missedList.value) {
        const g = it.group || "其他";
        if (!map[g])
          map[g] = [];
        map[g].push(it);
      }
      return map;
    });
    const missedGroups = common_vendor.computed(() => Object.keys(missedByGroup.value));
    const int = (n) => Math.round(n);
    const dateText = (ts) => {
      if (!ts)
        return "";
      try {
        const d = new Date(ts);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      } catch {
        return "";
      }
    };
    function copyMissed() {
      const t = trip.value;
      if (!t)
        return;
      const title = t.title || "行程";
      const time = t.time || "";
      const loc = t.location ? `@${t.location}` : "";
      const lines = [];
      lines.push(`【缺失清单】${title}`);
      if (time || loc)
        lines.push(`${time} ${loc}`);
      lines.push("----------------");
      if (missedGroups.value.length === 0) {
        lines.push("无缺失物品");
      } else {
        for (const g of missedGroups.value) {
          lines.push(`[${g}]`);
          const items = missedByGroup.value[g].map((it) => it.name).join("、");
          lines.push(items);
        }
      }
      common_vendor.index.setClipboardData({
        data: lines.join("\n"),
        success: () => common_vendor.index.showToast({ title: "已复制", icon: "success" })
      });
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      return common_vendor.e({
        a: common_vendor.t((_a = trip.value) == null ? void 0 : _a.title),
        b: common_vendor.t(((_b = trip.value) == null ? void 0 : _b.time) || "时间未设置"),
        c: (_c = trip.value) == null ? void 0 : _c.location
      }, ((_d = trip.value) == null ? void 0 : _d.location) ? {
        d: common_vendor.t(trip.value.location)
      } : {}, {
        e: (_e = trip.value) == null ? void 0 : _e.completionDate
      }, ((_f = trip.value) == null ? void 0 : _f.completionDate) ? {
        f: common_vendor.t(dateText(trip.value.completionDate))
      } : {}, {
        g: typeof ((_g = trip.value) == null ? void 0 : _g.recoveryRate) === "number"
      }, typeof ((_h = trip.value) == null ? void 0 : _h.recoveryRate) === "number" ? {
        h: common_vendor.t(int(trip.value.recoveryRate * 100))
      } : {}, {
        i: missedList.value.length > 0
      }, missedList.value.length > 0 ? {
        j: common_vendor.o(copyMissed)
      } : {}, {
        k: groupStats.value.length === 0
      }, groupStats.value.length === 0 ? {} : {}, {
        l: common_vendor.f(groupStats.value, (g, k0, i0) => {
          return {
            a: common_vendor.t(g.group),
            b: common_vendor.t(g.expected),
            c: common_vendor.t(g.returned),
            d: common_vendor.t(g.missed),
            e: g.group
          };
        }),
        m: missedList.value.length === 0
      }, missedList.value.length === 0 ? {} : {}, {
        n: common_vendor.f(missedGroups.value, (g, k0, i0) => {
          return {
            a: common_vendor.t(g),
            b: common_vendor.f(missedByGroup.value[g], (it, k1, i1) => {
              return {
                a: common_vendor.t(it.name),
                b: it.key
              };
            }),
            c: g
          };
        }),
        o: returning.value.length === 0
      }, returning.value.length === 0 ? {} : {}, {
        p: common_vendor.f(groups.value, (g, k0, i0) => {
          return {
            a: common_vendor.t(g),
            b: common_vendor.f(itemsByGroup.value[g], (it, k1, i1) => {
              return common_vendor.e({
                a: common_vendor.t(it.name),
                b: it.isConsumable
              }, it.isConsumable ? {} : {}, {
                c: it.id
              });
            }),
            c: g
          };
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-24143b2e"]]);
wx.createPage(MiniProgramPage);
