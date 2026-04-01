import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import DarkDialog from '../../src/components/DarkDialog.vue'
import '../../tests/mocks/uni.js'

describe('DarkDialog Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render confirm dialog', async () => {
    const wrapper = mount(DarkDialog, {
      props: {
        visible: true,
        mode: 'confirm',
        title: '确认删除',
        message: '确定要删除吗？',
        confirmText: '删除',
        cancelText: '取消'
      }
    })
    
    await nextTick()
    
    expect(wrapper.find('.dialog-title').text()).toBe('确认删除')
    expect(wrapper.find('.dialog-message').text()).toBe('确定要删除吗？')
    expect(wrapper.find('.confirm-btn').text()).toBe('删除')
    expect(wrapper.find('.cancel-btn').text()).toBe('取消')
  })

  it('should render input dialog', async () => {
    const wrapper = mount(DarkDialog, {
      props: {
        visible: true,
        mode: 'input',
        title: '输入名称',
        placeholder: '请输入名称',
        modelValue: ''
      }
    })
    
    await nextTick()
    
    expect(wrapper.find('.dialog-title').text()).toBe('输入名称')
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('input').attributes('placeholder')).toBe('请输入名称')
  })

  it('should render action sheet', async () => {
    const actions = ['选项1', '选项2', '选项3']
    const wrapper = mount(DarkDialog, {
      props: {
        visible: true,
        mode: 'action',
        title: '选择操作',
        actions
      }
    })
    
    await nextTick()
    
    expect(wrapper.find('.dialog-title').text()).toBe('选择操作')
    const actionItems = wrapper.findAll('.action-item')
    expect(actionItems).toHaveLength(3)
    expect(actionItems[0].text()).toBe('选项1')
  })

  it('should emit confirm event', async () => {
    const wrapper = mount(DarkDialog, {
      props: {
        visible: true,
        mode: 'confirm'
      }
    })
    
    await nextTick()
    await wrapper.find('.confirm-btn').trigger('tap')
    
    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('should emit cancel event', async () => {
    const wrapper = mount(DarkDialog, {
      props: {
        visible: true,
        mode: 'confirm'
      }
    })
    
    await nextTick()
    await wrapper.find('.cancel-btn').trigger('tap')
    
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('should emit update:modelValue for input', async () => {
    const wrapper = mount(DarkDialog, {
      props: {
        visible: true,
        mode: 'input',
        modelValue: ''
      }
    })
    
    await nextTick()
    
    const input = wrapper.find('input')
    await input.setValue('测试输入')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['测试输入'])
  })

  it('should emit action event with index', async () => {
    const actions = ['选项1', '选项2']
    const wrapper = mount(DarkDialog, {
      props: {
        visible: true,
        mode: 'action',
        actions
      }
    })
    
    await nextTick()
    
    const actionItems = wrapper.findAll('.action-item')
    await actionItems[1].trigger('tap')
    
    expect(wrapper.emitted('action')).toBeTruthy()
    expect(wrapper.emitted('action')[0]).toEqual([{ index: 1 }])
  })

  it('should close on mask tap when closeOnMask is true', async () => {
    const wrapper = mount(DarkDialog, {
      props: {
        visible: true,
        mode: 'confirm',
        closeOnMask: true
      }
    })
    
    await nextTick()
    
    await wrapper.find('.dialog-mask').trigger('tap')
    
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should not close on mask tap when closeOnMask is false', async () => {
    const wrapper = mount(DarkDialog, {
      props: {
        visible: true,
        mode: 'confirm',
        closeOnMask: false
      }
    })
    
    await nextTick()
    
    await wrapper.find('.dialog-mask').trigger('tap')
    
    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('should apply danger style to confirm button', async () => {
    const wrapper = mount(DarkDialog, {
      props: {
        visible: true,
        mode: 'confirm',
        danger: true
      }
    })
    
    await nextTick()
    
    expect(wrapper.find('.confirm-btn').classes()).toContain('danger')
  })

  it('should not render when visible is false', async () => {
    const wrapper = mount(DarkDialog, {
      props: {
        visible: false,
        mode: 'confirm'
      }
    })
    
    await nextTick()
    
    expect(wrapper.find('.dialog-wrapper').exists()).toBe(false)
  })
})
