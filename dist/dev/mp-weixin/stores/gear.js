"use strict";
const common_vendor = require("../common/vendor.js");
function get(key, def) {
  try {
    const raw = common_vendor.index.getStorageSync(key);
    return raw ? JSON.parse(raw) : def;
  } catch {
    return def;
  }
}
function set(key, val) {
  try {
    common_vendor.index.setStorageSync(key, JSON.stringify(val));
  } catch {
  }
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
const DEFAULTS = [
  { id: uid(), name: "身份证", group: "证件", isConsumable: false },
  { id: uid(), name: "笔记本电脑", group: "电子", isConsumable: false },
  { id: uid(), name: "充电器+适配器", group: "电子", isConsumable: false },
  { id: uid(), name: "防晒霜", group: "个人护理", isConsumable: true }
];
const useGearStore = common_vendor.defineStore("gear", {
  state: () => ({
    items: get("gear", DEFAULTS)
  }),
  actions: {
    save() {
      set("gear", this.items);
    },
    add(name, group = "其他", isConsumable = false) {
      this.items.unshift({ id: uid(), name, group, isConsumable: !!isConsumable });
      this.save();
    },
    remove(id) {
      this.items = this.items.filter((i) => i.id !== id);
      this.save();
    },
    toggleConsumable(id) {
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx >= 0) {
        this.items[idx].isConsumable = !this.items[idx].isConsumable;
        this.save();
      }
    },
    exportData() {
      return this.items;
    },
    importData(data) {
      if (Array.isArray(data)) {
        this.items = data;
        this.save();
      }
    }
  }
});
exports.useGearStore = useGearStore;
