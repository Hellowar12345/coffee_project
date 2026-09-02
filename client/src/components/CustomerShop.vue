<template>
  <div class="flex w-full h-full">
    <!-- Sidebar Filters -->
    <aside class="w-72 bg-white border-r border-[#e5dcd5] flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div class="p-6 border-b border-gray-100">
        <h2 class="font-bold text-coffee-900 flex items-center gap-2">
          <i class="fa-solid fa-filter text-amber-500"></i> 篩選條件
        </h2>
      </div>

      <div class="p-6 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
        <!-- Keyword Search -->
        <div>
          <label class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">關鍵字搜尋</label>
          <div class="relative group">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-gray-400 group-focus-within:text-coffee-600 transition"></i>
            <input
              v-model="filters.keyword"
              type="text"
              placeholder="Arabica, 深焙..."
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-coffee-600 focus:ring-1 focus:ring-coffee-600 transition"
            />
          </div>
        </div>

        <!-- Bean Type Filter -->
        <div>
          <label class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">豆種 (Bean Type)</label>
          <select
            v-model="filters.bean"
            class="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-coffee-600 focus:border-coffee-600 block p-2.5"
          >
            <option value="all">所有豆種 (All)</option>
            <option value="Arabica">Arabica</option>
            <option value="Robusta">Robusta</option>
            <option value="Liberica">Liberica</option>
            <option value="Excelsa">Excelsa</option>
          </select>
        </div>

        <!-- Roast Level Filter -->
        <div>
          <label class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">烘焙度 (Roast Level)</label>
          <select
            v-model="filters.roast"
            class="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-coffee-600 focus:border-coffee-600 block p-2.5"
          >
            <option value="all">所有烘焙度 (All)</option>
            <option value="Light">Light (淺焙)</option>
            <option value="Medium">Medium (中焙)</option>
            <option value="Dark">Dark (深焙)</option>
          </select>
        </div>

        <!-- Supplier Filter -->
        <div>
          <label class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">供應商 (Supplier)</label>
          <div class="space-y-3">
            <label
              v-for="supplier in suppliers"
              :key="supplier.供應商編號"
              class="flex items-center gap-3 cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition -mx-2"
            >
              <input
                type="checkbox"
                :value="supplier.供應商編號"
                v-model="filters.supplierIds"
                class="w-4 h-4 rounded border-gray-300 text-coffee-600 focus:ring-coffee-600 accent-coffee-600"
              />
              <span class="text-sm text-gray-600 group-hover:text-coffee-800 font-medium">{{ supplier.供應商名稱 }}</span>
            </label>
          </div>
        </div>

        <!-- Price Range -->
        <div>
          <label class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">價格範圍 (Price)</label>
          <div class="mb-2 text-sm font-bold text-coffee-800">
            NT$ {{ filters.priceMax }} (含) 以下
          </div>
          <input
            v-model="filters.priceMax"
            type="range"
            min="100"
            max="2000"
            step="50"
            class="w-full accent-coffee-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div class="p-4 border-t border-gray-100 bg-gray-50">
        <button
          @click="clearFilters"
          class="w-full py-2 text-sm text-gray-500 hover:text-coffee-600 hover:bg-white border border-transparent hover:border-gray-200 rounded transition font-medium"
        >
          清除所有條件
        </button>
      </div>
    </aside>

    <!-- Products Grid -->
    <div class="flex-1 overflow-y-auto p-8 bg-[#f8f5f2] relative">
      <div class="flex justify-between items-end mb-6">
        <div>
          <h2 class="text-2xl font-bold text-coffee-900">熱銷咖啡豆</h2>
          <p class="text-sm text-gray-500 mt-1">找到 {{ filteredProducts.length }} 項符合的商品</p>
        </div>
        <select
          v-model="sortOption"
          class="bg-white border border-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-coffee-600 cursor-pointer"
        >
          <option value="">預設排序</option>
          <option value="price_asc">價格由低到高</option>
          <option value="price_desc">價格由高到低</option>
          <option value="newest">最新上架</option>
        </select>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
        <div
          v-for="product in filteredProducts"
          :key="product.產品編號"
          @click="$emit('openModal', product)"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer group flex flex-col h-full"
        >
          <div class="h-48 bg-[#f4ece8] relative flex items-center justify-center overflow-hidden">
            <img
              src="/image/coffee_bean.jpg"
              :alt="product.產品敘述"
              class="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition duration-500"
            />

            <div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-bold text-coffee-800 shadow-sm border border-white/50">
              {{ product.供應商名稱 }}
            </div>
            <div class="absolute top-3 right-3">
              <span
                v-if="product.庫存 > 10"
                class="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1"
              >
                <i class="fa-solid fa-check"></i> 庫存充足
              </span>
              <span
                v-else-if="product.庫存 > 0"
                class="bg-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1 animate-pulse"
              >
                <i class="fa-solid fa-fire"></i> 僅剩 {{ product.庫存 }} 件!
              </span>
              <span
                v-else
                class="bg-gray-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1"
              >
                <i class="fa-solid fa-ban"></i> 已售完
              </span>
            </div>
          </div>

          <div class="p-5 flex flex-col flex-1">
            <div class="mb-2">
              <h4 class="font-bold text-gray-800 text-lg leading-tight group-hover:text-coffee-600 transition">
                {{ formatProductName(product.產品敘述, false) }}
              </h4>
            </div>
            <p class="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">{{ product.產品編號 }}</p>

            <div class="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
              <div>
                <span class="text-[10px] text-gray-400 uppercase font-bold">Price</span>
                <div class="text-xl font-bold text-coffee-800">NT$ {{ product.單價 }}</div>
              </div>
              <button
                @click.stop="addToCart(product)"
                :disabled="product.庫存 === 0"
                class="w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition group-active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none bg-amber-350 text-white hover:bg-[#d98e5e] shadow-amber-200"
              >
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredProducts.length === 0" class="text-center py-20">
        <i class="fa-solid fa-inbox text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500">沒有找到符合條件的商品</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

const emit = defineEmits(['openModal', 'addToCart'])

const addToCart = (product) => {
  emit('addToCart', product)
}

const suppliers = ref([])
const products = ref([])
const sortOption = ref('')
const filters = ref({
  keyword: '',
  bean: 'all',
  roast: 'all',
  supplierIds: [],
  priceMax: 2000
})

// All filtering and sorting is done on the backend
const filteredProducts = computed(() => products.value)

const fetchSuppliers = async () => {
  try {
    const response = await axios.get('/api/suppliers')
    suppliers.value = response.data
  } catch (error) {
    console.error('Error fetching suppliers:', error)
  }
}

const fetchProducts = async () => {
  try {
    const params = {}
    if (filters.value.keyword) {
      params.keyword = filters.value.keyword
    }
    if (filters.value.bean !== 'all') {
      params.bean = filters.value.bean
    }
    if (filters.value.roast !== 'all') {
      params.roast = filters.value.roast
    }
    if (filters.value.priceMax < 2000) {
      params.price_max = filters.value.priceMax
    }
    if (filters.value.supplierIds.length === 1) {
      params.supplier_id = filters.value.supplierIds[0]
    }
    if (sortOption.value) {
      params.sort = sortOption.value
    }

    const response = await axios.get('/api/products', { params })
    products.value = response.data
    console.log(`Fetched ${response.data.length} products with sort: ${sortOption.value || 'default'}, first price: ${response.data[0]?.單價}`)
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}

const clearFilters = () => {
  filters.value = {
    keyword: '',
    bean: 'all',
    roast: 'all',
    supplierIds: [],
    priceMax: 2000
  }
  sortOption.value = ''
  fetchProducts()
}

watch(filters, () => {
  fetchProducts()
}, { deep: true })

watch(sortOption, () => {
  fetchProducts()
})

onMounted(() => {
  fetchSuppliers()
  fetchProducts()
})

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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
