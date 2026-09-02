<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <!-- Top Navbar - View Mode Switcher -->
    <div class="bg-gray-900 text-white text-xs py-2 px-4 flex justify-between items-center z-50 shrink-0">
      <span class="font-mono text-gray-400">CoffeeBeans Order System</span>
      <div class="flex items-center gap-3">
        <span class="text-gray-400 uppercase font-bold tracking-wider">Current View:</span>
        <button
          @click="viewMode = 'customer'"
          :class="viewMode === 'customer' ? 'bg-green-600 text-white shadow-lg shadow-green-900/50' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'"
          class="px-4 py-1 rounded transition-all duration-200 font-medium"
        >
          <i class="fa-solid fa-user mr-1"></i> Customer
        </button>
        <button
          @click="viewMode = 'admin'"
          :class="viewMode === 'admin' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'"
          class="px-4 py-1 rounded transition-all duration-200 font-medium"
        >
          <i class="fa-solid fa-gear mr-1"></i> Admin
        </button>
      </div>
    </div>

    <!-- Customer View -->
    <div v-if="viewMode === 'customer'" class="flex-1 flex flex-col h-full bg-[#fdfbf7] overflow-hidden">
      <!-- Customer Header -->
      <header class="bg-white shadow-sm border-b border-[#e5dcd5] py-3 px-6 flex justify-between items-center z-20 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-coffee-900 rounded-full flex items-center justify-center text-white shadow-md">
            <i class="fa-solid fa-mug-hot"></i>
          </div>
          <div>
            <h1 class="text-xl font-bold text-coffee-900 tracking-wide leading-none">CoffeeBeans</h1>
            <span class="text-[10px] text-coffee-600 font-medium tracking-widest uppercase">Premium Selection</span>
          </div>
        </div>

        <nav class="hidden md:flex gap-1 bg-coffee-50 p-1 rounded-lg">
          <button
            @click="customerTab = 'shop'"
            :class="customerTab === 'shop' ? 'bg-white shadow text-coffee-800' : 'text-gray-500 hover:text-coffee-600'"
            class="px-6 py-2 rounded-md text-sm font-bold transition-all"
          >
            <i class="fa-solid fa-store mr-2"></i> 線上訂購
          </button>
          <button
            @click="customerTab = 'history'"
            :class="customerTab === 'history' ? 'bg-white shadow text-coffee-800' : 'text-gray-500 hover:text-coffee-600'"
            class="px-6 py-2 rounded-md text-sm font-bold transition-all"
          >
            <i class="fa-solid fa-clock-rotate-left mr-2"></i> 歷史訂單
          </button>
        </nav>

        <div class="flex items-center gap-5">
          <div @click="toggleCartModal" class="relative cursor-pointer group">
            <div class="p-2 rounded-full hover:bg-coffee-50 transition text-gray-600 group-hover:text-coffee-600">
              <i class="fa-solid fa-cart-shopping text-xl"></i>
            </div>
            <span
              v-if="cartItemCount > 0"
              class="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-sm border border-white"
            >
              {{ cartItemCount }}
            </span>
          </div>

          <!-- User Info / Login -->
          <div v-if="!user" class="border-l pl-5 border-gray-200">
            <button
              @click="showLoginModal = true"
              class="px-4 py-2 bg-coffee-600 hover:bg-coffee-700 text-white text-sm font-bold rounded-lg transition shadow-md flex items-center gap-2"
            >
              <i class="fa-solid fa-right-to-bracket"></i>
              Login
            </button>
          </div>

          <div v-else class="flex items-center gap-3 border-l pl-5 border-gray-200">
            <div class="w-9 h-9 bg-gradient-to-br from-amber-350 to-coffee-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
              {{ user.name.charAt(0) }}
            </div>
            <div class="text-left">
              <div class="text-sm font-bold text-gray-700">{{ user.name }}</div>
              <div class="text-xs text-gray-500">{{ user.memberId }}</div>
            </div>
            <button
              @click="handleLogout"
              class="ml-2 px-3 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition flex items-center gap-1 font-medium"
              title="Logout"
            >
              <i class="fa-solid fa-right-from-bracket"></i>
              Logout
            </button>
          </div>
        </div>
      </header>

      <!-- Customer Content Area -->
      <main class="flex-1 overflow-hidden flex relative">
        <CustomerShop
          v-if="customerTab === 'shop'"
          @openModal="openProductModal"
          @addToCart="addToCart"
        />
        <CustomerHistory
          v-if="customerTab === 'history'"
          ref="historyComponent"
          :memberId="user?.memberId || ''"
        />
      </main>
    </div>

    <!-- Product Modal -->
    <ProductModal
      :product="selectedProduct"
      @close="closeProductModal"
      @addToCart="addToCart"
    />

    <!-- Login Modal -->
    <LoginModal
      :isOpen="showLoginModal"
      @close="showLoginModal = false"
      @loginSuccess="handleLoginSuccess"
    />

    <!-- Cart Modal -->
    <CartModal
      :isOpen="showCartModal"
      :cart="cart"
      :cartTotal="cartTotal"
      @close="showCartModal = false"
      @incrementItem="incrementItem"
      @decrementItem="decrementItem"
      @clearCart="clearCart"
      @checkout="handleCheckout"
    />

    <!-- Admin View -->
    <div v-if="viewMode === 'admin'" class="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">
      <!-- Admin Header -->
      <header class="bg-white shadow-sm border-b border-gray-200 py-4 px-6 shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow">
              <i class="fa-solid fa-chart-line"></i>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-800">管理員儀表板</h1>
              <span class="text-xs text-gray-500">Admin Dashboard</span>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <i class="fa-solid fa-user-shield text-blue-600"></i>
              <span class="text-sm font-medium text-gray-700">Administrator</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Admin Content Area -->
      <AdminDashboard />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import CustomerShop from './components/CustomerShop.vue'
import CustomerHistory from './components/CustomerHistory.vue'
import ProductModal from './components/ProductModal.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import LoginModal from './components/LoginModal.vue'
import CartModal from './components/CartModal.vue'

const viewMode = ref('customer')
const customerTab = ref('shop')
const selectedProduct = ref(null)
const showLoginModal = ref(false)
const showCartModal = ref(false)
const user = ref(null)
const historyComponent = ref(null)

// ==================== CART STATE ====================
const cart = ref([])

// Computed: Cart Total
const cartTotal = computed(() => {
  return cart.value.reduce((total, item) => {
    return total + (item.單價 * item.quantity)
  }, 0)
})

// Computed: Cart Item Count
const cartItemCount = computed(() => {
  return cart.value.reduce((count, item) => count + item.quantity, 0)
})

// Load cart from localStorage
const loadCart = () => {
  const savedCart = localStorage.getItem('cart')
  if (savedCart) {
    try {
      cart.value = JSON.parse(savedCart)
      console.log('Cart loaded from localStorage:', cart.value)
    } catch (error) {
      console.error('Error parsing saved cart:', error)
      localStorage.removeItem('cart')
    }
  }
}

// Save cart to localStorage
const saveCart = () => {
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

// Watch cart changes and persist to localStorage
watch(cart, () => {
  saveCart()
}, { deep: true })

// Add item to cart
const addToCart = (product, quantity = 1) => {
  const existingItem = cart.value.find(item => item.產品編號 === product.產品編號)
  const currentQty = existingItem ? existingItem.quantity : 0
  const maxStock = product.庫存

  if (currentQty + quantity > maxStock) {
    alert(`庫存不足！目前僅剩 ${maxStock} 件`)
    return
  }

  if (existingItem) {
    existingItem.quantity += quantity
    console.log(`Incremented ${product.產品敘述} quantity by ${quantity}`)
  } else {
    cart.value.push({
      產品編號: product.產品編號,
      產品敘述: product.產品敘述,
      單價: product.單價,
      供應商名稱: product.供應商名稱,
      quantity: quantity,
      maxStock: maxStock
    })
    console.log(`Added ${product.產品敘述} to cart`)
  }
  
  // Feedback
  alert(`已將 ${product.產品敘述} 加入購物車！`)
}

// Increment item quantity
const incrementItem = (productId) => {
  const item = cart.value.find(item => item.產品編號 === productId)
  if (item) {
    if (item.maxStock !== undefined && item.quantity >= item.maxStock) {
      alert('已達庫存上限')
      return
    }
    item.quantity++
  }
}

// Decrement item quantity
const decrementItem = (productId) => {
  const item = cart.value.find(item => item.產品編號 === productId)
  if (item) {
    item.quantity--
    if (item.quantity <= 0) {
      cart.value = cart.value.filter(i => i.產品編號 !== productId)
      console.log(`Removed ${item.產品敘述} from cart`)
    }
  }
}

// Clear cart
const clearCart = () => {
  cart.value = []
  console.log('Cart cleared')
}

// Toggle cart modal
const toggleCartModal = () => {
  showCartModal.value = !showCartModal.value
}

// Handle checkout
const handleCheckout = async () => {
  if (cart.value.length === 0) {
    alert('購物車是空的')
    return
  }

  // Check if user is logged in
  if (!user.value) {
    alert('請先登入才能結帳')
    showCartModal.value = false
    showLoginModal.value = true
    return
  }

  try {
    // Prepare order data
    const items = cart.value.map(item => ({
      productId: item.產品編號,
      supplierId: item.供應商名稱.charAt(0) === '精' ? 'S001' :
                   item.供應商名稱.charAt(0) === '綠' ? 'S002' :
                   item.供應商名稱.charAt(0) === '豆' ? 'S003' :
                   item.供應商名稱.charAt(0) === '咖' ? 'S004' : 'S005',
      quantity: item.quantity,
      price: item.單價
    }))

    const orderData = {
      memberId: user.value.memberId,
      items: items,
      total: cartTotal.value,
      deliverId: 'D001',
      address: user.value.address || '台北市信義區'
    }

    console.log('Submitting order:', orderData)

    // Call API
    const response = await axios.post('/api/orders', orderData)

    if (response.data.success) {
      const orderId = response.data.orderId
      const total = cartTotal.value

      // Clear cart and close modal
      clearCart()
      showCartModal.value = false

      // Show success message
      alert(`✓ 訂單已成功送出！\n\n訂單編號: ${orderId}\n總金額: NT$ ${total}\n\n感謝您的購買！`)

      // If on history tab, refresh the list
      if (customerTab.value === 'history' && historyComponent.value) {
        historyComponent.value.fetchOrders()
      }
    }
  } catch (error) {
    console.error('Checkout error:', error)
    alert(`結帳失敗：${error.response?.data?.error || error.message}\n\n請稍後再試`)
  }
}

// ==================== USER STATE ====================

// Load user from localStorage on mount
onMounted(() => {
  // Load user
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser)
      console.log('User loaded from localStorage:', user.value)
    } catch (error) {
      console.error('Error parsing saved user:', error)
      localStorage.removeItem('user')
    }
  }

  // Load cart
  loadCart()
})

const handleLoginSuccess = (userData) => {
  user.value = userData
  console.log('Login successful:', userData)
}

const handleLogout = () => {
  if (confirm('確定要登出嗎？')) {
    user.value = null
    localStorage.removeItem('user')
    console.log('User logged out')
  }
}

// ==================== PRODUCT MODAL ====================

const openProductModal = (product) => {
  selectedProduct.value = product
}

const closeProductModal = () => {
  selectedProduct.value = null
}
</script>

<style scoped>
/* Additional component-specific styles if needed */
</style>
