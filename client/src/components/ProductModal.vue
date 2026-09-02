<template>
  <div
    v-if="product"
    class="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row animate-scale-up relative">
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 z-20 w-8 h-8 bg-white/50 hover:bg-white rounded-full flex items-center justify-center transition backdrop-blur text-gray-500 hover:text-gray-800"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>

      <!-- Product Image Section -->
      <div class="w-full md:w-5/12 bg-[#f4ece8] flex items-center justify-center relative overflow-hidden h-64 md:h-auto">
        <img
          src="/image/coffee_bean.jpg"
          :alt="product.產品敘述"
          class="w-full h-full object-cover"
        />
        <div class="absolute bottom-4 left-0 right-0 text-center">
          <span class="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-coffee-800 shadow-sm border border-white/50">
            {{ product.供應商名稱 }}
          </span>
        </div>
      </div>

      <!-- Product Details Section -->
      <div class="w-full md:w-7/12 p-8 flex flex-col bg-white">
        <div class="mb-1">
          <span
            v-if="product.庫存 > 10"
            class="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-wider"
          >
            庫存充足
          </span>
          <span
            v-else-if="product.庫存 > 0"
            class="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase tracking-wider"
          >
            僅剩 {{ product.庫存 }} 件!
          </span>
          <span
            v-else
            class="text-[10px] font-bold text-gray-600 bg-gray-50 px-2 py-0.5 rounded uppercase tracking-wider"
          >
            已售完
          </span>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-2 leading-tight">{{ formatProductName(product.產品敘述, true) }}</h2>
        <div class="h-1 w-10 bg-amber-350 rounded mb-4"></div>

        <p class="text-sm text-gray-500 mb-6 leading-relaxed flex-1">
          {{ product.產品編號 }}
          <br><br>
          這款精選咖啡豆經過嚴格篩選與烘焙，保留了產地最純粹的風味。適合手沖或義式濃縮，帶給您早晨最美好的開始。
        </p>

        <div class="border-t border-gray-100 pt-6 mt-auto">
          <div class="flex justify-between items-end mb-4">
            <div>
              <span class="text-xs text-gray-400 uppercase font-bold block mb-1">Price</span>
              <span class="text-3xl font-bold text-coffee-900 font-mono">NT$ {{ product.單價 }}</span>
            </div>
            <div class="flex items-center border border-gray-200 rounded-lg h-10">
              <button
                @click="decrementQty"
                class="px-3 hover:bg-gray-100 text-gray-500 transition"
                :disabled="product.庫存 === 0"
              >
                -
              </button>
              <span class="px-2 text-sm font-bold text-gray-700 min-w-[20px] text-center">{{ quantity }}</span>
              <button
                @click="incrementQty"
                class="px-3 hover:bg-gray-100 text-gray-500 transition"
                :disabled="product.庫存 === 0"
              >
                +
              </button>
            </div>
          </div>

          <button
            @click="addToCart"
            :disabled="product.庫存 === 0"
            class="w-full font-bold py-3.5 rounded-xl shadow-lg transition transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none bg-coffee-900 hover:bg-coffee-800 text-white shadow-coffee-900/20"
          >
            <i class="fa-solid fa-cart-plus"></i> 加入購物車
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'addToCart'])

const quantity = ref(1)

const incrementQty = () => {
  if (quantity.value < props.product.庫存) {
    quantity.value++
  }
}

const decrementQty = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const addToCart = () => {
  emit('addToCart', props.product, quantity.value)
  emit('close')
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
