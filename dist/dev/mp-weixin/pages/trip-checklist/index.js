"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_trip = require("../../stores/trip.js");
const stores_templates = require("../../stores/templates.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const tripId = common_vendor.ref("");
    const mode = common_vendor.ref("departure");
    const isReturn = common_vendor.computed(() => mode.value === "return");
    const store = stores_trip.useTripStore();
    const tplStore = stores_templates.useTemplateStore();
    const list = common_vendor.ref([]);
    common_vendor.onLoad((options) => {
      tripId.value = (options == null ? void 0 : options.id) || "";
      mode.value = (options == null ? void 0 : options.mode) || "departure";
      list.value = store.itemsOf(tripId.value, isReturn.value);
    });
    const items = common_vendor.computed(() => list.value);
    const itemsByGroup = common_vendor.computed(() => {
      const map = {};
      for (const it of items.value) {
        const g = it.group || "其他";
        (map[g] || (map[g] = [])).push(it);
      }
      return map;
    });
    const groups = common_vendor.computed(() => Object.keys(itemsByGroup.value));
    const totalCount = common_vendor.computed(() => isReturn.value ? items.value.filter((i) => !i.isConsumable).length : items.value.length);
    const checkedCount = common_vendor.computed(
      () => items.value.filter((i) => i.isChecked && (isReturn.value ? !i.isConsumable : true)).length
    );
    const canFinish = common_vendor.computed(() => isReturn.value || checkedCount.value === totalCount.value);
    function toggle(it) {
      store.toggleItem(tripId.value, isReturn.value, it.id);
      list.value = store.itemsOf(tripId.value, isReturn.value);
    }
    function finish() {
      if (isReturn.value) {
        store.finishReturnCheck(tripId.value);
      } else {
        store.finishDepartureCheck(tripId.value);
      }
      common_vendor.index.navigateBack();
    }
    function saveAsTemplate() {
      const depItems = store.itemsOf(tripId.value, false);
      const base = depItems.filter((i) => i.isChecked).map((i) => ({ name: i.name, group: i.group }));
      if (base.length === 0) {
        common_vendor.index.showToast({ title: "请先勾选出发清单", icon: "none" });
        return;
      }
      common_vendor.index.showModal({
        title: "保存为模板",
        editable: true,
        placeholderText: "输入模板名称",
        success: (res) => {
          var _a;
          if (res.confirm) {
            const t = tplStore.addTemplate(((_a = res.content) == null ? void 0 : _a.trim()) || "我的模板");
            for (const it of base)
              tplStore.addItem(t.id, it);
            common_vendor.index.showToast({ title: "已保存到模板库", icon: "none" });
          }
        }
      });
    }
    function addFromGear() {
      common_vendor.index.navigateTo({ url: `/src/pages/gear-picker/index?target=trip&id=${tripId.value}&isReturn=${isReturn.value ? "1" : "0"}` });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(isReturn.value ? "返程" : "出发"),
        b: common_vendor.t(checkedCount.value),
        c: common_vendor.t(totalCount.value),
        d: items.value.length === 0
      }, items.value.length === 0 ? {} : {}, {
        e: common_vendor.f(groups.value, (g, k0, i0) => {
          return {
            a: common_vendor.t(g),
            b: common_vendor.f(itemsByGroup.value[g], (it, k1, i1) => {
              return common_vendor.e({
                a: common_vendor.t(it.name),
                b: it.isConsumable
              }, it.isConsumable ? {} : {}, {
                c: !!it.isChecked,
                d: it.id,
                e: common_vendor.o(($event) => toggle(it), it.id)
              });
            }),
            c: g
          };
        }),
        f: !isReturn.value
      }, !isReturn.value ? {
        g: common_vendor.o(addFromGear)
      } : {}, {
        h: common_vendor.o(saveAsTemplate),
        i: common_vendor.t(isReturn.value ? "清点完成" : "清点完成"),
        j: !canFinish.value,
        k: common_vendor.o(finish)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-314e77f7"]]);
wx.createPage(MiniProgramPage);
