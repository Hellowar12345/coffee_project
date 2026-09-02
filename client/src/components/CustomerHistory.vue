<template>
  <div class="w-full h-full overflow-y-auto bg-gray-50 p-8">
    <div class="max-w-5xl mx-auto">
      <div class="flex justify-between items-end mb-8">
        <div>
          <h2 class="text-2xl font-bold text-coffee-900">歷史訂單紀錄</h2>
          <p class="text-sm text-gray-500 mt-1">查詢會員 {{ props.memberId }} 的所有交易明細</p>
        </div>
        <div class="bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-end">
          <span class="text-xs text-gray-400 uppercase font-bold">總消費金額</span>
          <span class="font-bold text-coffee-600 text-xl font-mono">NT$ {{ totalSpent }}</span>
        </div>
      </div>

      <div v-if="orders.length === 0" class="text-center py-20">
        <i class="fa-solid fa-receipt text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500">尚無訂單記錄</p>
      </div>

      <div class="space-y-4 pb-10">
        <div
          v-for="order in orders"
          :key="order.訂單編號"
          class="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden transition-all duration-300"
          :class="{ 'ring-2 ring-coffee-100': order.expanded }"
        >
          <!-- Order Header (Clickable) -->
          <div
            @click="toggleOrder(order)"
            class="p-5 cursor-pointer hover:bg-gray-50 transition select-none flex flex-wrap md:flex-nowrap items-center gap-6"
          >
            <div class="flex items-center gap-4 min-w-[180px]">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-colors"
                :class="order.expanded ? 'bg-coffee-600 text-white' : 'bg-gray-100 text-gray-400'"
              >
                <i class="fa-solid fa-file-invoice"></i>
              </div>
              <div>
                <div class="text-xs text-gray-400 uppercase font-bold mb-0.5">Order ID</div>
                <div class="font-mono font-bold text-gray-800">{{ order.訂單編號 }}</div>
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1">
              <div>
                <div class="text-xs text-gray-400 uppercase font-bold mb-0.5">訂單日期</div>
                <div class="text-sm font-medium text-gray-700">{{ formatDate(order.訂單日期) }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-400 uppercase font-bold mb-0.5">物流配送</div>
                <div class="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <i class="fa-solid fa-truck text-gray-400 text-xs"></i> {{ order.貨運公司名稱 }}
                </div>
              </div>
              <div>
                <div class="text-xs text-gray-400 uppercase font-bold mb-0.5">訂單狀態 (Status)</div>
                <div class="flex items-center gap-3">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1"
                    :class="{
                      'bg-red-100 text-red-700': order.Status === 'Unpaid',
                      'bg-green-100 text-green-700': order.Status === 'Paid',
                      'bg-blue-100 text-blue-700': order.Status === 'Shipped'
                    }"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="{
                        'bg-red-500': order.Status === 'Unpaid',
                        'bg-green-500': order.Status === 'Paid',
                        'bg-blue-500': order.Status === 'Shipped'
                      }"
                    ></span>
                    {{ order.Status }}
                  </span>
                  
                  <button
                    v-if="order.Status === 'Unpaid'"
                    @click.stop="payOrder(order.訂單編號)"
                    class="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded shadow-sm transition"
                  >
                    立即付款
                  </button>
                </div>
              </div>
            </div>

            <div class="text-right min-w-[100px]">
              <div class="text-lg font-bold text-coffee-800 font-mono">NT$ {{ calculateOrderTotal(order) }}</div>
            </div>

            <div
              class="text-gray-300 transform transition-transform duration-300"
              :class="{ 'rotate-180 text-coffee-600': order.expanded }"
            >
              <i class="fa-solid fa-chevron-down"></i>
            </div>
          </div>

          <!-- Order Details (Expandable) -->
          <div v-if="order.expanded" class="bg-gray-50 border-t border-gray-100 p-6 animate-fade-in">
            <div class="flex items-center gap-2 mb-4">
              <i class="fa-solid fa-list-ul text-coffee-600"></i>
              <h4 class="text-sm font-bold text-gray-700">訂單明細 (Items)</h4>
            </div>

            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 text-xs text-gray-500 uppercase font-bold border-b border-gray-200">
                  <tr>
                    <th class="px-4 py-3 text-left">產品名稱</th>
                    <th class="px-4 py-3 text-left">供應商</th>
                    <th class="px-4 py-3 text-right">單價</th>
                    <th class="px-4 py-3 text-center">數量</th>
                    <th class="px-4 py-3 text-right bg-gray-100/50">小計</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="item in order.items" :key="item.序號" class="hover:bg-gray-50 transition">
                    <td class="px-4 py-3 font-medium text-gray-800">{{ formatProductName(item.產品敘述, false) }}</td>
                    <td class="px-4 py-3 text-xs text-gray-500">{{ item.供應商編號 }}</td>
                    <td class="px-4 py-3 text-right text-gray-600 font-mono">NT$ {{ item.單價 }}</td>
                    <td class="px-4 py-3 text-center font-mono bg-gray-50/50">{{ item.數量 }}</td>
                    <td class="px-4 py-3 text-right font-bold text-coffee-700 font-mono bg-gray-100/50">
                      NT$ {{ item.總價 }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-4 flex justify-between items-center text-xs text-gray-500 px-2">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-location-dot"></i>
                <span class="font-medium">送貨地址:</span> {{ order.送貨地址 }}
              </div>
              <button class="hover:text-coffee-600 hover:underline">下載電子發票</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineProps, defineExpose, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  memberId: {
    type: String,
    required: true
  }
})

const orders = ref([])

const totalSpent = computed(() => {
  return orders.value.reduce((sum, order) => sum + calculateOrderTotal(order), 0)
})

const fetchOrders = async () => {
  if (!props.memberId) return
  
  try {
    const response = await axios.get(`/api/orders/${props.memberId}`)
    orders.value = response.data.map(order => ({
      ...order,
      expanded: false
    }))
  } catch (error) {
    console.error('Error fetching orders:', error)
  }
}

// Expose fetchOrders to parent
defineExpose({ fetchOrders })

const toggleOrder = (order) => {
  order.expanded = !order.expanded
}

const calculateOrderTotal = (order) => {
  if (!order.items || order.items.length === 0) return 0
  return order.items.reduce((sum, item) => sum + (item.總價 || 0), 0)
}

const formatDate = (dateString) => {
  if (!dateString) return '---'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

onMounted(() => {
  fetchOrders()
})

// Refetch if memberId changes
watch(() => props.memberId, () => {
  fetchOrders()
})

const payOrder = async (orderId) => {
  if (!confirm('確定要進行付款嗎？')) return
  
  try {
    await axios.post(`/api/pay/${orderId}`)
    alert('付款成功！')
    fetchOrders()
  } catch (error) {
    console.error('Payment error:', error)
    alert('付款失敗，請稍後再試')
  }
}

const formatProductName = (rawName, useChineseBean = false) => {
  if (!rawName) return ''
  const parts = rawName.split(' - ')
  if (parts.length !== 3) return rawName

  let beanMap
  if (useChineseBean) {
    beanMap = {
      'Ara': '阿拉比卡',
      'Rob': '羅布斯塔',
      'Lib': '賴比瑞亞',
      'Exc': '伊克賽爾薩'
    }
  } else {
    beanMap = {
      'Ara': 'Arabica',
      'Rob': 'Robusta',
      'Lib': 'Liberica',
      'Exc': 'Excelsa'
    }
  }
  
  const roastMap = {
    'D': '深焙',
    'M': '中焙',
    'L': '淺焙'
  }

  const bean = beanMap[parts[0]] || parts[0]
  const roast = roastMap[parts[1]] || parts[1]
  const size = parts[2] + 'kg'

  return `${bean} / ${roast} / ${size}`
}
</script>
