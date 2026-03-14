"use strict";
const common_vendor = require("../common/vendor.js");
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
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
function packingKey(id, isReturn) {
  return (isReturn ? "PackingList_Return_" : "PackingList_") + id;
}
const DEFAULT_TEMPLATE = {
  name: "商务出差",
  items: [
    { name: "身份证", group: "证件" },
    { name: "笔记本电脑", group: "电子" },
    { name: "充电器", group: "电子" }
  ]
};
const useTripStore = common_vendor.defineStore("trip", {
  state: () => ({
    trips: get("trips", [])
  }),
  getters: {
    ongoing(state) {
      return state.trips.filter((t) => {
        if (t.status === "archived")
          return false;
        if (t.status === "returnPhase")
          return this.progress(t) < 1;
        return true;
      });
    },
    toArchive(state) {
      return state.trips.filter((t) => t.status === "returnPhase" && this.progress(t) >= 1);
    },
    sourceBuckets(state) {
      const list = state.trips.filter((t) => t.status !== "archived");
      const map = {
        all: list,
        template: [],
        temporary: []
      };
      for (const t of list) {
        const src = t.source || "模板";
        if (src === "临时" || src === "Temporary") {
          map.temporary.push(t);
        } else {
          map.template.push(t);
        }
      }
      return map;
    }
  },
  actions: {
    saveTrips() {
      set("trips", this.trips);
    },
    progress(trip) {
      if (trip.status === "archived")
        return 1;
      const isReturn = trip.status === "returnPhase";
      const key = packingKey(trip.id, isReturn);
      const items = get(key, []);
      if (!items.length)
        return 0;
      const total = isReturn ? items.filter((i) => !i.isConsumable).length : items.length;
      if (total === 0)
        return 1;
      const checked = items.filter((i) => i.isChecked && (isReturn ? !i.isConsumable : true)).length;
      return Math.min(1, checked / total);
    },
    createTemporaryTrip(title) {
      const id = uid();
      const trip = {
        id,
        title: title || "临时行程",
        time: "立即出发",
        location: "未设置",
        source: "临时",
        status: "preparation"
      };
      this.trips.unshift(trip);
      this.saveTrips();
      set(packingKey(id, false), []);
      return trip;
    },
    createTripFromTemplate(tpl = DEFAULT_TEMPLATE) {
      const id = uid();
      const trip = {
        id,
        title: tpl.name,
        time: "立即出发",
        location: "未设置",
        source: "模板",
        status: "preparation"
      };
      this.trips.unshift(trip);
      this.saveTrips();
      const base = tpl.items.map((i) => ({
        id: uid(),
        name: i.name,
        group: i.group || "其他",
        isChecked: false,
        isConsumable: !!i.isConsumable,
        weight: i.weight || null,
        quantity: i.quantity || 1
      }));
      set(packingKey(id, false), base);
      return trip;
    },
    updateTripMeta(tripId, payload) {
      const idx = this.trips.findIndex((t) => t.id === tripId);
      if (idx < 0)
        return;
      this.trips[idx] = {
        ...this.trips[idx],
        ...payload
      };
      this.saveTrips();
    },
    markPacked(tripId) {
      const idx = this.trips.findIndex((t) => t.id === tripId);
      if (idx >= 0) {
        this.trips[idx].status = "packed";
        this.saveTrips();
      }
    },
    startReturnIfNeeded(tripId) {
      const idx = this.trips.findIndex((t) => t.id === tripId);
      if (idx < 0)
        return;
      this.trips[idx];
      const dep = get(packingKey(tripId, false), []);
      const retKey = packingKey(tripId, true);
      if (!get(retKey, null)) {
        const cloned = dep.map((i) => ({ ...i, id: uid(), isChecked: true }));
        set(retKey, cloned);
      }
      this.trips[idx].status = "returnPhase";
      this.saveTrips();
    },
    toggleItem(tripId, isReturn, itemId) {
      const key = packingKey(tripId, isReturn);
      const items = get(key, []);
      const idx = items.findIndex((i) => i.id === itemId);
      if (idx >= 0) {
        items[idx].isChecked = !items[idx].isChecked;
        set(key, items);
      }
    },
    finishDepartureCheck(tripId) {
      this.markPacked(tripId);
    },
    finishReturnCheck(tripId) {
      const key = packingKey(tripId, true);
      let items = get(key, []);
      items = items.filter((i) => i.isChecked);
      set(key, items);
      const idx = this.trips.findIndex((t) => t.id === tripId);
      if (idx >= 0) {
        this.trips[idx].status = "returnPhase";
        this.saveTrips();
      }
    },
    depart(tripId) {
      const idx = this.trips.findIndex((t) => t.id === tripId);
      if (idx >= 0) {
        this.trips[idx].status = "departed";
        this.saveTrips();
      }
    },
    addItemsToTrip(tripId, isReturn, items) {
      const key = packingKey(tripId, isReturn);
      const cur = get(key, []);
      const exists = new Set(cur.map((i) => `${i.name}|${i.group || "其他"}`));
      for (const it of items) {
        const k = `${it.name}|${it.group || "其他"}`;
        if (!exists.has(k)) {
          cur.push({
            id: uid(),
            name: it.name,
            group: it.group || "其他",
            isConsumable: !!it.isConsumable,
            isChecked: false,
            weight: null,
            quantity: 1
          });
        }
      }
      set(key, cur);
    },
    archiveTrip(tripId) {
      const idx = this.trips.findIndex((t) => t.id === tripId);
      if (idx < 0)
        return;
      const trip = this.trips[idx];
      const dep = get(packingKey(tripId, false), []);
      const ret = get(packingKey(tripId, true), []);
      const depKeys = new Set(dep.filter((i) => i.isChecked && !i.isConsumable).map((i) => `${i.name}|${i.group}`));
      const returned = ret.filter((i) => depKeys.has(`${i.name}|${i.group}`)).length;
      const rate = depKeys.size ? returned / depKeys.size : null;
      this.trips[idx] = {
        ...trip,
        status: "archived",
        recoveryRate: rate,
        completionDate: Date.now()
      };
      this.saveTrips();
    },
    itemsOf(tripId, isReturn) {
      return get(packingKey(tripId, isReturn), []);
    },
    exportData() {
      const data = {
        trips: this.trips,
        packingLists: {}
      };
      for (const t of this.trips) {
        data.packingLists[packingKey(t.id, false)] = get(packingKey(t.id, false), []);
        if (t.status === "returnPhase" || t.status === "archived") {
          data.packingLists[packingKey(t.id, true)] = get(packingKey(t.id, true), []);
        }
      }
      return data;
    },
    importData(data) {
      if (!data || !data.trips)
        return;
      this.trips = data.trips;
      this.saveTrips();
      if (data.packingLists) {
        for (const k in data.packingLists) {
          set(k, data.packingLists[k]);
        }
      }
    }
  }
});
exports.useTripStore = useTripStore;
