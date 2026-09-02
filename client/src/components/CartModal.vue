<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click.self="close"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all flex flex-col">
      <!-- Header -->
      <div class="bg-gradient-to-r from-coffee-800 to-coffee-600 px-6 py-5 flex justify-between items-center shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <i class="fa-solid fa-cart-shopping text-white text-lg"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-white">購物車</h3>
            <p class="text-xs text-coffee-100">Shopping Cart</p>
          </div>
        </div>
        <button
          @click="close"
          class="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition text-white"
        >
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <!-- Empty Cart State -->
      <div v-if="cart.length === 0" class="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="fa-solid fa-cart-shopping text-4xl text-gray-300"></i>
        </div>
        <h4 class="text-xl font-bold text-gray-700 mb-2">購物車是空的</h4>
        <p class="text-sm text-gray-500 mb-6">您尚未添加任何商品到購物車</p>
        <button
          @click="close"
          class="px-6 py-2.5 bg-coffee-600 hover:bg-coffee-700 text-white text-sm font-bold rounded-lg transition shadow-md"
        >
          <i class="fa-solid fa-store mr-2"></i>
          繼續購物
        </button>
      </div>

      <!-- Cart Items -->
      <div v-else class="flex-1 overflow-y-auto p-6 space-y-3">
        <div
          v-for="item in cart"
          :key="item.產品編號"
          class="bg-gray-50 rounded-xl p-4 flex items-center gap-4 hover:bg-gray-100 transition border border-gray-200"
        >
          <!-- Product Icon -->
          <img
            src="/image/coffee_bean.jpg"
            :alt="item.產品敘述"
            class="w-16 h-16 object-cover rounded-lg shadow-sm border border-gray-200"
          />

          <!-- Product Info -->
          <div class="flex-1 min-w-0">
            <h5 class="font-bold text-gray-800 text-sm mb-1 truncate">{{ formatProductName(item.產品敘述, false) }}</h5>
            <p class="text-xs text-gray-500 mb-2">{{ item.供應商名稱 }}</p>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400">單價:</span>
              <span class="font-mono font-bold text-coffee-700">NT$ {{ item.單價 }}</span>
            </div>
          </div>

          <!-- Quantity Controls -->
          <div class="flex items-center gap-2 shrink-0">
            <button
              @click="decrementItem(item.產品編號)"
              class="w-8 h-8 rounded-full bg-gray-200 hover:bg-red-500 hover:text-white flex items-center justify-center transition text-gray-600 font-bold"
            >
              <i class="fa-solid fa-minus text-xs"></i>
            </button>
            <span class="w-10 text-center font-mono font-bold text-gray-800">{{ item.quantity }}</span>
            <button
              @click="incrementItem(item.產品編號)"
              class="w-8 h-8 rounded-full bg-gray-200 hover:bg-coffee-600 text-gray-600 hover:text-white flex items-center justify-center transition font-bold"
            >
              <i class="fa-solid fa-plus text-xs"></i>
            </button>
          </div>

          <!-- Item Subtotal -->
          <div class="text-right shrink-0 min-w-[100px]">
            <div class="text-xs text-gray-400 mb-1">小計</div>
            <div class="font-mono font-bold text-lg text-coffee-800">NT$ {{ item.單價 * item.quantity }}</div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="cart.length > 0" class="border-t border-gray-200 p-6 bg-gray-50 shrink-0">
        <!-- Total Summary -->
        <div class="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <div>
            <p class="text-sm text-gray-500 mb-1">商品總數</p>
            <p class="text-lg font-bold text-gray-800">{{ cartItemCount }} 件</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500 mb-1">總金額</p>
            <p class="text-2xl font-bold text-coffee-800 font-mono">NT$ {{ formatNumber(cartTotal) }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button
            @click="handleClearCart"
            class="flex-1 px-4 py-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-sm font-bold rounded-lg transition flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-trash-can"></i>
            清空購物車
          </button>
          <button
            @click="handleCheckout"
            class="flex-[2] px-6 py-3 bg-gradient-to-r from-coffee-600 to-coffee-700 hover:from-coffee-700 hover:to-coffee-800 text-white text-sm font-bold rounded-lg transition shadow-lg shadow-coffee-200 flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-credit-card"></i>
            結帳 (NT$ {{ formatNumber(cartTotal) }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  cart: Array,
  cartTotal: Number
})

const emit = defineEmits(['close', 'incrementItem', 'decrementItem', 'clearCart', 'checkout'])

const cartItemCount = computed(() => {
  return props.cart.reduce((count, item) => count + item.quantity, 0)
})

const formatNumber = (num) => {
  if (!num) return '0'
  return new Intl.NumberFormat('zh-TW').format(num)
}

const close = () => {
  emit('close')
}

const incrementItem = (productId) => {
  emit('incrementItem', productId)
}

const decrementItem = (productId) => {
  emit('decrementItem', productId)
}

const handleClearCart = () => {
  if (confirm('確定要清空購物車嗎？')) {
    emit('clearCart')
  }
}

const handleCheckout = () => {
  emit('checkout')
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
