/**
 * 预设模板库
 * 提供开箱即用的出行清单模板
 */

import { defineStore } from 'pinia'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// 模板分类定义
export const TEMPLATE_CATEGORIES = [
  { id: 'all', name: '全部', icon: '📋' },
  { id: 'outdoor', name: '户外运动', icon: '🏔️' },
  { id: 'business', name: '商务出行', icon: '💼' },
  { id: 'travel', name: '旅行度假', icon: '✈️' },
  { id: 'daily', name: '日常生活', icon: '🏠' },
  { id: 'special', name: '特殊场景', icon: '🎯' }
]

// 预设模板数据
export const PRESET_TEMPLATES = [
  // ===== 户外运动 =====
  {
    id: 'preset_camping',
    name: '露营野餐',
    category: 'outdoor',
    icon: '⛺',
    description: '周末露营、野外烧烤必备清单',
    reminderRules: ['id-check', 'power-check', 'weather-check'],
    items: [
      { id: uid(), name: '身份证', group: '证件', isImportant: true },
      { id: uid(), name: '帐篷', group: '装备', isImportant: true },
      { id: uid(), name: '睡袋', group: '装备' },
      { id: uid(), name: '防潮垫', group: '装备' },
      { id: uid(), name: '野餐垫', group: '装备' },
      { id: uid(), name: '露营灯', group: '装备' },
      { id: uid(), name: '便携桌椅', group: '装备' },
      { id: uid(), name: '烧烤炉/卡式炉', group: '炊具' },
      { id: uid(), name: '木炭/气罐', group: '炊具', isConsumable: true },
      { id: uid(), name: '食材', group: '食物', isConsumable: true },
      { id: uid(), name: '饮用水', group: '食物', isConsumable: true },
      { id: uid(), name: '充电宝', group: '电子', isImportant: true },
      { id: uid(), name: '驱蚊水', group: '防护用品', isConsumable: true },
      { id: uid(), name: '防晒霜', group: '防护用品', isConsumable: true },
      { id: uid(), name: '急救包', group: '安全', isImportant: true },
      { id: uid(), name: '垃圾袋', group: '环保', isImportant: true },
    ],
  },
  {
    id: 'preset_mountain',
    name: '登山徒步',
    category: 'outdoor',
    icon: '🏔️',
    description: '登山、远足、多日徒步清单',
    reminderRules: ['id-check', 'medicine-check', 'power-check'],
    items: [
      { id: uid(), name: '身份证', group: '证件', isImportant: true },
      { id: uid(), name: '登山鞋', group: '装备', isImportant: true },
      { id: uid(), name: '登山杖', group: '装备' },
      { id: uid(), name: '冲锋衣', group: '服装' },
      { id: uid(), name: '速干裤', group: '服装' },
      { id: uid(), name: '保暖层', group: '服装' },
      { id: uid(), name: '帽子', group: '服装' },
      { id: uid(), name: '手套', group: '服装' },
      { id: uid(), name: '登山包', group: '装备', isImportant: true },
      { id: uid(), name: '雨衣', group: '装备' },
      { id: uid(), name: '头灯', group: '装备', isImportant: true },
      { id: uid(), name: '指南针/GPS', group: '导航' },
      { id: uid(), name: '能量棒/巧克力', group: '食物', isConsumable: true },
      { id: uid(), name: '水壶/水袋', group: '装备', isImportant: true },
      { id: uid(), name: '滤水器', group: '装备' },
      { id: uid(), name: '急救包', group: '安全', isImportant: true },
      { id: uid(), name: '口哨', group: '安全' },
      { id: uid(), name: '求生毯', group: '安全' },
    ],
  },
  {
    id: 'preset_cycling',
    name: '长途骑行',
    category: 'outdoor',
    icon: '🚴',
    description: '公路骑行、山地骑行清单',
    reminderRules: ['id-check', 'medicine-check', 'power-check'],
    items: [
      { id: uid(), name: '身份证', group: '证件', isImportant: true },
      { id: uid(), name: '头盔', group: '安全', isImportant: true },
      { id: uid(), name: '骑行眼镜', group: '装备' },
      { id: uid(), name: '骑行手套', group: '装备' },
      { id: uid(), name: '骑行服', group: '服装' },
      { id: uid(), name: '锁鞋', group: '装备' },
      { id: uid(), name: '骑行袜', group: '服装' },
      { id: uid(), name: '车灯（前后）', group: '电子', isImportant: true },
      { id: uid(), name: '尾灯', group: '电子' },
      { id: uid(), name: '码表', group: '电子' },
      { id: uid(), name: '补胎工具包', group: '维修', isImportant: true },
      { id: uid(), name: '打气筒', group: '维修' },
      { id: uid(), name: '备用内胎', group: '维修' },
      { id: uid(), name: '多功能工具', group: '维修' },
      { id: uid(), name: '链条油', group: '维修' },
      { id: uid(), name: '水壶', group: '补给', isImportant: true },
      { id: uid(), name: '能量胶/盐丸', group: '补给', isConsumable: true },
      { id: uid(), name: '充电宝', group: '电子' },
      { id: uid(), name: '防晒霜', group: '防护用品' },
      { id: uid(), name: '急救包', group: '安全' },
    ],
  },
  {
    id: 'preset_skiing',
    name: '滑雪运动',
    category: 'outdoor',
    icon: '⛷️',
    description: '单板/双板滑雪清单',
    reminderRules: ['id-check', 'medicine-check', 'power-check'],
    items: [
      { id: uid(), name: '身份证', group: '证件', isImportant: true },
      { id: uid(), name: '雪票/季卡', group: '票据' },
      { id: uid(), name: '雪镜', group: '装备', isImportant: true },
      { id: uid(), name: '头盔', group: '安全', isImportant: true },
      { id: uid(), name: '滑雪手套', group: '装备' },
      { id: uid(), name: '护脸/面罩', group: '装备' },
      { id: uid(), name: '滑雪服', group: '服装' },
      { id: uid(), name: '速干内衣', group: '服装' },
      { id: uid(), name: '滑雪袜', group: '服装' },
      { id: uid(), name: '护具（护臀/护膝）', group: '安全' },
      { id: uid(), name: '暖宝宝', group: '保暖', isConsumable: true },
      { id: uid(), name: '防冻霜', group: '防护用品' },
      { id: uid(), name: '充电宝', group: '电子' },
      { id: uid(), name: '能量零食', group: '补给', isConsumable: true },
      { id: uid(), name: '保温杯', group: '补给' },
      { id: uid(), name: '创可贴', group: '医疗' },
    ],
  },
  
  // ===== 商务出行 =====
  {
    id: 'preset_business',
    name: '商务出差',
    category: 'business',
    icon: '💼',
    description: '短期商务差旅标准清单',
    reminderRules: ['id-check'],
    items: [
      { id: uid(), name: '身份证', group: '证件', isImportant: true },
      { id: uid(), name: '名片', group: '商务', isImportant: true },
      { id: uid(), name: '笔记本电脑', group: '电子', isImportant: true },
      { id: uid(), name: '充电器', group: '电子' },
      { id: uid(), name: '鼠标', group: '电子' },
      { id: uid(), name: '转接头', group: '电子' },
      { id: uid(), name: '西装/正装', group: '服装', isImportant: true },
      { id: uid(), name: '衬衫', group: '服装' },
      { id: uid(), name: '领带', group: '服装' },
      { id: uid(), name: '皮鞋', group: '服装' },
      { id: uid(), name: '皮带', group: '服装' },
      { id: uid(), name: '睡衣', group: '服装' },
      { id: uid(), name: '洗漱包', group: '个人护理' },
      { id: uid(), name: '便携衣架', group: '其他' },
      { id: uid(), name: '文件夹/资料', group: '商务' },
    ],
  },
  {
    id: 'preset_conference',
    name: '会议参展',
    category: 'business',
    icon: '📊',
    description: '参加会议、展会活动清单',
    reminderRules: ['id-check'],
    items: [
      { id: uid(), name: '身份证', group: '证件', isImportant: true },
      { id: uid(), name: '参会证/门票', group: '票据' },
      { id: uid(), name: '名片（大量）', group: '商务', isImportant: true },
      { id: uid(), name: '宣传册/手册', group: '商务' },
      { id: uid(), name: '易拉宝/海报', group: '展示' },
      { id: uid(), name: '笔记本电脑', group: '电子' },
      { id: uid(), name: '充电宝', group: '电子' },
      { id: uid(), name: '录音笔', group: '电子' },
      { id: uid(), name: '记事本', group: '文具' },
      { id: uid(), name: '笔', group: '文具' },
      { id: uid(), name: '商务正装', group: '服装' },
      { id: uid(), name: '舒适的鞋', group: '服装' },
      { id: uid(), name: '喉糖', group: '个人护理' },
      { id: uid(), name: '润唇膏', group: '个人护理' },
    ],
  },
  
  // ===== 旅行度假 =====
  {
    id: 'preset_beach',
    name: '海滩度假',
    category: 'travel',
    icon: '🏖️',
    description: '海边度假、沙滩活动清单',
    reminderRules: [],
    items: [
      { id: uid(), name: '身份证', group: '证件', isImportant: true },
      { id: uid(), name: '泳衣/泳裤', group: '服装' },
      { id: uid(), name: '泳镜', group: '装备' },
      { id: uid(), name: '沙滩巾', group: '装备' },
      { id: uid(), name: '拖鞋/凉鞋', group: '服装' },
      { id: uid(), name: '遮阳帽', group: '防护用品' },
      { id: uid(), name: '太阳镜', group: '防护用品' },
      { id: uid(), name: '防晒霜', group: '防护用品', isConsumable: true },
      { id: uid(), name: '晒后修复', group: '防护用品' },
      { id: uid(), name: '防水手机袋', group: '电子' },
      { id: uid(), name: '充电宝', group: '电子' },
      { id: uid(), name: '防水包', group: '装备' },
      { id: uid(), name: '浮潜装备', group: '装备' },
      { id: uid(), name: '沙滩玩具', group: '娱乐' },
      { id: uid(), name: '防水创可贴', group: '医疗' },
    ],
  },
  {
    id: 'preset_photography',
    name: '摄影采风',
    category: 'travel',
    icon: '📷',
    description: '摄影旅行、器材清单',
    reminderRules: ['power-check'],
    items: [
      { id: uid(), name: '身份证', group: '证件', isImportant: true },
      { id: uid(), name: '相机机身', group: '摄影器材', isImportant: true },
      { id: uid(), name: '广角镜头', group: '摄影器材' },
      { id: uid(), name: '长焦镜头', group: '摄影器材' },
      { id: uid(), name: '三脚架', group: '摄影器材' },
      { id: uid(), name: '存储卡（备用）', group: '摄影器材' },
      { id: uid(), name: '相机电池', group: '摄影器材', isImportant: true },
      { id: uid(), name: '充电器', group: '摄影器材' },
      { id: uid(), name: '相机包', group: '摄影器材' },
      { id: uid(), name: '清洁套装', group: '摄影器材' },
      { id: uid(), name: 'ND镜/CPL镜', group: '摄影器材' },
      { id: uid(), name: '无人机', group: '摄影器材' },
      { id: uid(), name: '无人机电池', group: '摄影器材' },
      { id: uid(), name: '笔记本电脑', group: '后期' },
      { id: uid(), name: '读卡器', group: '后期' },
      { id: uid(), name: '移动硬盘', group: '后期' },
      { id: uid(), name: '头灯', group: '户外' },
      { id: uid(), name: '雨衣', group: '户外' },
    ],
  },
  
  // ===== 日常生活 =====
  {
    id: 'preset_gym',
    name: '健身房',
    category: 'daily',
    icon: '💪',
    description: '日常健身训练清单',
    reminderRules: [],
    items: [
      { id: uid(), name: '运动服', group: '服装' },
      { id: uid(), name: '运动鞋', group: '装备' },
      { id: uid(), name: '运动毛巾', group: '装备' },
      { id: uid(), name: '水壶/摇杯', group: '装备' },
      { id: uid(), name: '蛋白粉/补剂', group: '补给', isConsumable: true },
      { id: uid(), name: '耳机', group: '电子' },
      { id: uid(), name: '心率带/手表', group: '电子' },
      { id: uid(), name: '护腕/护膝', group: '防护' },
      { id: uid(), name: '手套', group: '装备' },
      { id: uid(), name: '发带/束发', group: '配件' },
      { id: uid(), name: '沐浴露/洗发水', group: '洗浴', isConsumable: true },
      { id: uid(), name: '拖鞋', group: '装备' },
      { id: uid(), name: '换洗衣物', group: '服装' },
    ],
  },
  {
    id: 'preset_swimming',
    name: '游泳训练',
    category: 'daily',
    icon: '🏊',
    description: '泳池游泳清单',
    reminderRules: [],
    items: [
      { id: uid(), name: '泳衣/泳裤', group: '装备', isImportant: true },
      { id: uid(), name: '泳镜', group: '装备', isImportant: true },
      { id: uid(), name: '泳帽', group: '装备' },
      { id: uid(), name: '鼻塞/耳塞', group: '装备' },
      { id: uid(), name: '浮板/划水掌', group: '训练' },
      { id: uid(), name: '脚蹼', group: '训练' },
      { id: uid(), name: '毛巾', group: '装备' },
      { id: uid(), name: '沐浴露/洗发水', group: '洗浴', isConsumable: true },
      { id: uid(), name: '身体乳', group: '洗浴' },
      { id: uid(), name: '拖鞋', group: '装备' },
      { id: uid(), name: '防水包', group: '装备' },
      { id: uid(), name: '水/运动饮料', group: '补给', isConsumable: true },
    ],
  },
  {
    id: 'preset_parents',
    name: '带娃出行',
    category: 'daily',
    icon: '👶',
    description: '带婴幼儿外出清单',
    reminderRules: [],
    items: [
      { id: uid(), name: '身份证', group: '证件', isImportant: true },
      { id: uid(), name: '户口本（备用）', group: '证件' },
      { id: uid(), name: '纸尿裤', group: '必需品', isConsumable: true, isImportant: true },
      { id: uid(), name: '湿巾', group: '必需品', isConsumable: true, isImportant: true },
      { id: uid(), name: '干纸巾', group: '必需品', isConsumable: true },
      { id: uid(), name: '奶粉/奶瓶', group: '喂养', isImportant: true },
      { id: uid(), name: '保温杯', group: '喂养' },
      { id: uid(), name: '辅食/零食', group: '喂养', isConsumable: true },
      { id: uid(), name: '换洗衣物', group: '服装' },
      { id: uid(), name: '围兜/口水巾', group: '服装' },
      { id: uid(), name: '安抚玩具', group: '安抚' },
      { id: uid(), name: '推车', group: '装备' },
      { id: uid(), name: '背带', group: '装备' },
      { id: uid(), name: '保温毯', group: '装备' },
      { id: uid(), name: '常用药品', group: '医疗', isImportant: true },
      { id: uid(), name: '体温计', group: '医疗' },
      { id: uid(), name: '消毒喷雾', group: '清洁', isConsumable: true },
    ],
  },
  
  // ===== 特殊场景 =====
  {
    id: 'preset_moving',
    name: '搬家打包',
    category: 'special',
    icon: '📦',
    description: '搬家整理、物品打包清单',
    reminderRules: [],
    items: [
      { id: uid(), name: '纸箱（大中小）', group: '打包材料', isConsumable: true, isImportant: true },
      { id: uid(), name: '胶带', group: '打包材料', isConsumable: true, isImportant: true },
      { id: uid(), name: '记号笔/标签', group: '打包材料' },
      { id: uid(), name: '气泡膜', group: '打包材料' },
      { id: uid(), name: '保鲜膜', group: '打包材料' },
      { id: uid(), name: '塑料袋', group: '打包材料' },
      { id: uid(), name: '封口袋', group: '打包材料' },
      { id: uid(), name: '工具箱', group: '工具' },
      { id: uid(), name: '剪刀/美工刀', group: '工具' },
      { id: uid(), name: '螺丝刀套装', group: '工具' },
      { id: uid(), name: '收纳袋', group: '收纳' },
      { id: uid(), name: '真空压缩袋', group: '收纳' },
      { id: uid(), name: '搬家袋/编织袋', group: '收纳' },
      { id: uid(), name: '证件文件袋', group: '重要物品', isImportant: true },
      { id: uid(), name: '贵重物品', group: '重要物品', isImportant: true },
      { id: uid(), name: '充电线收纳包', group: '电子' },
      { id: uid(), name: '清洁用品', group: '清洁' },
    ],
  },
  {
    id: 'preset_hospital',
    name: '医院看病',
    category: 'special',
    icon: '🏥',
    description: '医院就医、体检清单',
    reminderRules: [],
    items: [
      { id: uid(), name: '身份证', group: '证件', isImportant: true },
      { id: uid(), name: '医保卡', group: '证件', isImportant: true },
      { id: uid(), name: '病历本', group: '医疗' },
      { id: uid(), name: '过往检查单', group: '医疗' },
      { id: uid(), name: '现金/银行卡', group: '财务' },
      { id: uid(), name: '手机/充电宝', group: '电子' },
      { id: uid(), name: '口罩', group: '防护', isConsumable: true, isImportant: true },
      { id: uid(), name: '消毒湿巾', group: '防护', isConsumable: true },
      { id: uid(), name: '纸巾', group: '用品', isConsumable: true },
      { id: uid(), name: '保温杯', group: '用品' },
      { id: uid(), name: '小零食', group: '食品', isConsumable: true },
      { id: uid(), name: '塑料袋', group: '用品' },
      { id: uid(), name: '常用药', group: '医疗' },
      { id: uid(), name: '眼镜/隐形眼镜', group: '个人物品' },
    ],
  },
  {
    id: 'preset_pet',
    name: '带宠出行',
    category: 'special',
    icon: '🐕',
    description: '带宠物旅行、就医清单',
    reminderRules: [],
    items: [
      { id: uid(), name: '宠物身份证/疫苗本', group: '证件', isImportant: true },
      { id: uid(), name: '牵引绳', group: '出行', isImportant: true },
      { id: uid(), name: '胸背带/项圈', group: '出行' },
      { id: uid(), name: '拾便袋', group: '清洁', isConsumable: true },
      { id: uid(), name: '便携水碗', group: '饮食' },
      { id: uid(), name: '狗粮/猫粮', group: '饮食', isConsumable: true },
      { id: uid(), name: '零食', group: '饮食', isConsumable: true },
      { id: uid(), name: '宠物湿巾', group: '清洁', isConsumable: true },
      { id: uid(), name: '尿垫', group: '清洁', isConsumable: true },
      { id: uid(), name: '宠物包/航空箱', group: '出行' },
      { id: uid(), name: '安抚玩具', group: '安抚' },
      { id: uid(), name: '常用药品', group: '医疗' },
      { id: uid(), name: '毛巾/毯子', group: '用品' },
      { id: uid(), name: '梳子', group: '护理' },
      { id: uid(), name: '嘴套', group: '安全' },
    ],
  },
]

// 按分类获取模板
export function getTemplatesByCategory(categoryId) {
  if (categoryId === 'all') {
    return PRESET_TEMPLATES
  }
  return PRESET_TEMPLATES.filter(t => t.category === categoryId)
}

// 获取单个预设模板
export function getPresetTemplateById(id) {
  return PRESET_TEMPLATES.find(t => t.id === id)
}

// 搜索预设模板
export function searchPresetTemplates(keyword) {
  const lowerKeyword = keyword.toLowerCase()
  return PRESET_TEMPLATES.filter(t => 
    t.name.toLowerCase().includes(lowerKeyword) ||
    t.description.toLowerCase().includes(lowerKeyword) ||
    t.items.some(item => item.name.toLowerCase().includes(lowerKeyword))
  )
}

// 生成用户可用的模板（添加真实ID）
export function generateUserTemplate(presetTemplate) {
  return {
    ...presetTemplate,
    id: uid(),
    source: 'preset',
    presetId: presetTemplate.id,
    items: presetTemplate.items.map(item => ({
      ...item,
      id: uid()
    })),
    importedAt: Date.now()
  }
}
