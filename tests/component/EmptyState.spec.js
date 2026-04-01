import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import EmptyState from '../../src/components/EmptyState.vue'
import '../../tests/mocks/uni.js'

describe('EmptyState Component', () => {
  it('should render with default trip type', async () => {
    const wrapper = mount(EmptyState, {
      props: {
        type: 'trip'
      }
    })
    
    await nextTick()
    
    expect(wrapper.find('.title').text()).toBe('准备好出发了吗？')
    expect(wrapper.find('.subtitle').text()).toContain('创建你的第一个行程')
    expect(wrapper.find('.action-btn').exists()).toBe(true)
  })

  it('should render different types correctly', async () => {
    const types = ['trip', 'template', 'error', 'network', 'archive']
    const expectedTitles = [
      '准备好出发了吗？',
      '还没有模板',
      '哎呀，出错了',
      '网络开小差了',
      '暂无归档行程'
    ]
    
    for (let i = 0; i < types.length; i++) {
      const wrapper = mount(EmptyState, {
        props: { type: types[i] }
      })
      await nextTick()
      
      expect(wrapper.find('.title').text()).toBe(expectedTitles[i])
    }
  })

  it('should render custom title and subtitle', async () => {
    const wrapper = mount(EmptyState, {
      props: {
        type: 'trip',
        title: '自定义标题',
        subtitle: '自定义描述'
      }
    })
    
    await nextTick()
    
    expect(wrapper.find('.title').text()).toBe('自定义标题')
    expect(wrapper.find('.subtitle').text()).toBe('自定义描述')
  })

  it('should hide action button when showAction is false', async () => {
    const wrapper = mount(EmptyState, {
      props: {
        type: 'trip',
        showAction: false
      }
    })
    
    await nextTick()
    
    expect(wrapper.find('.action-wrapper').exists()).toBe(false)
  })

  it('should emit action event when button clicked', async () => {
    const wrapper = mount(EmptyState, {
      props: {
        type: 'trip'
      }
    })
    
    await nextTick()
    
    await wrapper.find('.action-btn').trigger('tap')
    
    expect(wrapper.emitted('action')).toBeTruthy()
  })

  it('should apply compact class when compact prop is true', async () => {
    const wrapper = mount(EmptyState, {
      props: {
        type: 'trip',
        compact: true
      }
    })
    
    await nextTick()
    
    expect(wrapper.classes()).toContain('compact')
  })

  it('should render slot content', async () => {
    const wrapper = mount(EmptyState, {
      props: {
        type: 'trip'
      },
      slots: {
        default: '<view class="custom-slot">额外内容</view>'
      }
    })
    
    await nextTick()
    
    expect(wrapper.find('.custom-slot').exists()).toBe(true)
  })
})
