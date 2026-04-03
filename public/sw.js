/**
 * Service Worker for ReadyToGo PWA
 * 提供离线缓存、后台同步、推送通知支持
 */

const CACHE_NAME = 'readytogo-v1';
const STATIC_CACHE = 'readytogo-static-v1';
const DATA_CACHE = 'readytogo-data-v1';

// 需要预缓存的静态资源
const STATIC_ASSETS = [
  './',
  './index.html',
  './static/styles/main.css',
  './static/js/app.js',
  './static/icons/icon-192x192.png',
  './static/icons/icon-512x512.png',
  './static/images/placeholder.png'
];

// 安装时预缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Install completed');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Install failed:', err);
      })
  );
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name.startsWith('readytogo-') && 
                     name !== STATIC_CACHE && 
                     name !== DATA_CACHE;
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation completed');
        return self.clients.claim();
      })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 跳过非 GET 请求
  if (request.method !== 'GET') {
    return;
  }
  
  // 跳过浏览器扩展请求
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // API 请求使用网络优先策略
  if (url.pathname.includes('/api/') || url.pathname.includes('cloud')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // 图片使用缓存优先策略
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // 静态资源使用缓存优先策略
  if (STATIC_ASSETS.some(asset => url.pathname.includes(asset.replace('./', '')))) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // 其他请求使用网络优先策略
  event.respondWith(networkFirst(request));
});

/**
 * 网络优先策略
 * 先尝试网络，失败则回退到缓存
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // 成功获取，更新缓存
    if (networkResponse.ok) {
      const cache = await caches.open(DATA_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, falling back to cache:', request.url);
    
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // 离线回退页面
    if (request.destination === 'document') {
      return caches.match('./offline.html');
    }
    
    throw error;
  }
}

/**
 * 缓存优先策略
 * 先尝试缓存，失败则回退到网络
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  
  if (cached) {
    // 后台更新缓存
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, response);
          });
        }
      })
      .catch(() => {});
    
    return cached;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache and network both failed:', request.url);
    throw error;
  }
}

/**
 * 后台同步处理
 * 用于离线时保存操作，联网后自动同步
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    const db = await openDB('readytogo-sync', 1);
    const pending = await db.getAll('pending-sync');
    
    for (const item of pending) {
      try {
        await fetch(item.url, {
          method: item.method || 'POST',
          headers: item.headers || {},
          body: JSON.stringify(item.data)
        });
        
        await db.delete('pending-sync', item.id);
        console.log('[SW] Synced item:', item.id);
      } catch (error) {
        console.error('[SW] Sync failed for item:', item.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync process failed:', error);
  }
}

/**
 * 推送通知处理
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  const data = event.data?.json() || {};
  const title = data.title || 'ReadyToGo';
  const options = {
    body: data.body || '您有一条新消息',
    icon: './static/icons/icon-192x192.png',
    badge: './static/icons/icon-72x72.png',
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      { action: 'open', title: '打开' },
      { action: 'dismiss', title: '忽略' }
    ],
    data: data.payload || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * 通知点击处理
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const { notification } = event;
  const action = event.action;
  
  if (action === 'dismiss') {
    return;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        const payload = notification.data || {};
        const url = payload.url || './';
        
        // 查找已打开的窗口
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // 打开新窗口
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

/**
 * 消息处理（来自主线程）
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_ASSETS':
      event.waitUntil(cacheAssets(payload.assets));
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearCache());
      break;
      
    case 'GET_CACHE_STATUS':
      event.ports[0].postMessage(getCacheStatus());
      break;
  }
});

async function cacheAssets(assets) {
  const cache = await caches.open(STATIC_CACHE);
  return cache.addAll(assets);
}

async function clearCache() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map((name) => caches.delete(name))
  );
}

async function getCacheStatus() {
  const staticCache = await caches.open(STATIC_CACHE);
  const dataCache = await caches.open(DATA_CACHE);
  
  const staticKeys = await staticCache.keys();
  const dataKeys = await dataCache.keys();
  
  return {
    static: {
      count: staticKeys.length,
      size: 'unknown' // 实际大小需要计算
    },
    data: {
      count: dataKeys.length,
      size: 'unknown'
    }
  };
}

/**
 * IndexedDB 辅助函数（简化版）
 */
function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(new IDBWrapper(request.result));
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-sync')) {
        db.createObjectStore('pending-sync', { keyPath: 'id' });
      }
    };
  });
}

class IDBWrapper {
  constructor(db) {
    this.db = db;
  }
  
  getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

console.log('[SW] Service Worker loaded');
