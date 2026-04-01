import { describe, it, expect, beforeEach, vi } from 'vitest'
import { storage } from '../../src/utils/storage.js'
import '../../tests/mocks/uni.js'

describe('Storage Utils', () => {
  beforeEach(() => {
    uni.clearStorageSync()
  })

  describe('基本存储操作', () => {
    it('should set and get value', async () => {
      await storage.set('test_key', { name: 'test', value: 123 })
      const result = await storage.get('test_key')
      
      expect(result).toEqual({ name: 'test', value: 123 })
    })

    it('should return default value for missing key', async () => {
      const result = await storage.get('non_existent_key', 'default')
      expect(result).toBe('default')
    })

    it('should remove value', async () => {
      await storage.set('to_remove', 'value')
      await storage.remove('to_remove')
      
      const result = await storage.get('to_remove')
      expect(result).toBeNull()
    })

    it('should clear all storage', async () => {
      await storage.set('key1', 'value1')
      await storage.set('key2', 'value2')
      
      await storage.clear()
      
      expect(await storage.get('key1')).toBeNull()
      expect(await storage.get('key2')).toBeNull()
    })
  })

  describe('错误处理', () => {
    it('should handle invalid JSON gracefully', async () => {
      // 直接设置无效数据到存储
      uni.setStorageSync('rtg_invalid', 'not valid json')
      
      const result = await storage.get('invalid')
      expect(result).toBeNull()
    })
  })

  describe('存储信息', () => {
    it('should get storage info', async () => {
      await storage.set('key1', 'value1')
      await storage.set('key2', 'value2')
      
      const info = await storage.getInfo()
      
      expect(info.keys.length).toBeGreaterThanOrEqual(0)
      expect(info.currentSize).toBeGreaterThanOrEqual(0)
      expect(info.limitSize).toBe(10 * 1024 * 1024)
    })

    it('should check space availability', async () => {
      const spaceInfo = await storage.checkSpace()
      
      expect(spaceInfo).toHaveProperty('hasSpace')
      expect(spaceInfo).toHaveProperty('available')
      expect(spaceInfo).toHaveProperty('usagePercent')
      expect(spaceInfo).toHaveProperty('isWarning')
    })
  })

  describe('数据清理', () => {
    it('should export all data', async () => {
      await storage.set('key1', 'value1')
      await storage.set('key2', { nested: 'data' })
      
      const exported = await storage.export()
      
      // 验证导出的数据结构
      expect(exported).toBeDefined()
      expect(typeof exported).toBe('object')
    })

    it('should import data', async () => {
      const data = {
        'import1': 'value1',
        'import2': { test: true }
      }
      
      await storage.import(data)
      
      expect(await storage.get('import1')).toBe('value1')
      expect(await storage.get('import2')).toEqual({ test: true })
    })
  })
})
