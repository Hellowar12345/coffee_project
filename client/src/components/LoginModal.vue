<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click.self="close"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
      <!-- Header -->
      <div class="bg-gradient-to-r from-coffee-800 to-coffee-600 px-6 py-5 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <i class="fa-solid fa-user text-white text-lg"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-white">會員登入</h3>
            <p class="text-xs text-coffee-100">Login to Your Account</p>
          </div>
        </div>
        <button
          @click="close"
          class="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition text-white"
        >
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6">
        <!-- Test User Info -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div class="flex items-start gap-2">
            <i class="fa-solid fa-circle-info text-blue-500 mt-0.5"></i>
            <div class="text-xs">
              <p class="font-bold text-blue-800 mb-1">測試帳號資訊</p>
              <p class="text-blue-600">Email: <span class="font-mono font-bold">test@coffee.com</span></p>
              <p class="text-blue-600">Password: <span class="font-mono font-bold">123456</span></p>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <i class="fa-solid fa-circle-exclamation text-red-500"></i>
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Email</label>
            <div class="relative">
              <i class="fa-solid fa-envelope absolute left-3 top-3 text-gray-400"></i>
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                required
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-coffee-600 focus:ring-2 focus:ring-coffee-600/20 transition"
              />
            </div>
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Password</label>
            <div class="relative">
              <i class="fa-solid fa-lock absolute left-3 top-3 text-gray-400"></i>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                required
                class="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-coffee-600 focus:ring-2 focus:ring-coffee-600/20 transition"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-3 text-gray-400 hover:text-coffee-600 transition"
              >
                <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-coffee-600 hover:bg-coffee-700 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-coffee-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
            <i v-else class="fa-solid fa-right-to-bracket"></i>
            {{ loading ? '登入中...' : '登入' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'loginSuccess'])

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await axios.post('/api/login', {
      email: email.value,
      password: password.value
    })

    if (response.data.success) {
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user))

      // Emit success event
      emit('loginSuccess', response.data.user)

      // Close modal
      close()
    }
  } catch (error) {
    console.error('Login error:', error)
    if (error.response?.status === 401) {
      errorMessage.value = '電子郵件或密碼錯誤'
    } else {
      errorMessage.value = '登入失敗，請稍後再試'
    }
  } finally {
    loading.value = false
  }
}

const close = () => {
  email.value = ''
  password.value = ''
  errorMessage.value = ''
  showPassword.value = false
  emit('close')
}
</script>
