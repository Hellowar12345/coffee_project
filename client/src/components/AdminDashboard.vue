<template>
  <main class="flex-1 overflow-y-auto p-8 bg-[#f8f5f2]">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 flex justify-between items-end">
        <div>
          <h2 class="text-2xl font-bold text-coffee-900">儀表板總覽</h2>
          <p class="text-sm text-gray-500 mt-1">最新營運數據與待辦事項</p>
        </div>
        <div class="text-sm text-gray-500">Last updated: {{ lastUpdated }}</div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group"
        >
          <div
            class="absolute right-0 top-0 w-24 h-24 bg-red-50 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition duration-500"
          ></div>
          <div class="relative z-10">
            <div class="text-xs text-gray-500 uppercase font-bold mb-1">
              待出貨訂單 (Pending)
            </div>
            <div class="text-3xl font-bold text-coffee-900 font-mono">
              {{ stats.pendingShipments }}
            </div>
          </div>
          <div
            class="relative z-10 text-xs text-red-600 font-bold mt-2 animate-pulse"
          >
            <i class="fa-solid fa-circle-exclamation"></i> 需盡快處理
          </div>
          <div class="absolute right-4 top-4 text-red-400 text-xl z-10">
            <i class="fa-solid fa-truck-ramp-box"></i>
          </div>
        </div>

        <div
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group"
        >
          <div
            class="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition duration-500"
          ></div>
          <div class="relative z-10">
            <div class="text-xs text-gray-500 uppercase font-bold mb-1">
              庫存告急 (Low Stock)
            </div>
            <div class="flex items-center gap-3">
              <div class="text-3xl font-bold text-orange-600 font-mono">
                {{ lowStockItems.length }}
              </div>
              <button
                @click="openLowStockModal"
                class="px-2 py-1 text-[10px] bg-orange-100 text-orange-700 hover:bg-orange-200 rounded transition font-bold"
              >
                查看/補貨
              </button>
            </div>
          </div>
          <div class="relative z-10 text-xs text-gray-400 mt-2">
            Items &lt; 20
          </div>
          <div class="absolute right-4 top-4 text-orange-400 text-xl z-10">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
        </div>

        <div
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group"
        >
          <div
            class="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition duration-500"
          ></div>
          <div class="relative z-10 w-full">
            <div class="flex justify-between items-start mb-1">
              <div class="text-xs text-gray-500 uppercase font-bold">
                銷售額 (Revenue)
              </div>
              <div class="flex gap-1 relative z-20">
                <select
                  v-model="filterYear"
                  class="text-[10px] border border-gray-200 rounded px-1 py-0.5 bg-white text-gray-600 focus:outline-none focus:border-coffee-500 cursor-pointer"
                >
                  <option value="all">所有年份</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
                <select
                  v-model="filterMonth"
                  :disabled="filterYear === 'all'"
                  class="text-[10px] border border-gray-200 rounded px-1 py-0.5 bg-white text-gray-600 focus:outline-none focus:border-coffee-500 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="all">全年度</option>
                  <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
                </select>
              </div>
            </div>
            <div class="text-3xl font-bold text-coffee-900 font-mono">
              NT$ {{ formatNumber(stats.totalSales) }}
            </div>
          </div>
          <div
            class="relative z-10 flex items-center gap-1 text-xs text-green-600 font-bold mt-2"
          >
            <i class="fa-solid fa-chart-line"></i>
            <span v-if="filterYear === 'all'">Historical Total</span>
            <span v-else
              >{{ filterYear }}
              <span v-if="filterMonth !== 'all'">
                / {{ filterMonth }}月</span
              ></span
            >
          </div>
          <div class="absolute right-4 top-4 text-green-400 text-xl z-10">
            <i class="fa-solid fa-sack-dollar"></i>
          </div>
        </div>

        <div
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group"
        >
          <div
            class="absolute right-0 top-0 w-24 h-24 bg-purple-50 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition duration-500"
          ></div>
          <div class="relative z-10">
            <div class="text-xs text-gray-500 uppercase font-bold mb-1">
              總會員數 (Members)
            </div>
            <div class="text-3xl font-bold text-coffee-900 font-mono">
              {{ formatNumber(stats.totalMembers) }}
            </div>
          </div>
          <div
            class="relative z-10 flex items-center gap-1 text-xs text-purple-600 font-bold mt-2"
          >
            <i class="fa-solid fa-user-plus"></i> Active
          </div>
          <div class="absolute right-4 top-4 text-purple-400 text-xl z-10">
            <i class="fa-solid fa-users"></i>
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]"
      >
        <div
          class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#fdfbf7]"
        >
          <div class="flex gap-1 bg-gray-200/30 p-1 rounded-lg">
            <button
              @click="currentTab = 'pending'"
              :class="
                currentTab === 'pending'
                  ? 'bg-white text-coffee-800 shadow-sm'
                  : 'text-gray-500 hover:text-coffee-600'
              "
              class="px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2"
            >
              <div
                v-if="currentTab === 'pending'"
                class="w-2 h-2 bg-amber-500 rounded-full"
              ></div>
              待處理訂單
            </button>
            <button
              @click="currentTab = 'history'"
              :class="
                currentTab === 'history'
                  ? 'bg-white text-coffee-800 shadow-sm'
                  : 'text-gray-500 hover:text-coffee-600'
              "
              class="px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2"
            >
              <i class="fa-solid fa-clock-rotate-left"></i> 歷史紀錄 (已出貨)
            </button>
          </div>
          <button
            @click="refreshTableData"
            class="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded text-gray-500 hover:text-coffee-600 hover:border-coffee-200 transition"
          >
            <i class="fa-solid fa-rotate-right mr-1"></i> Refresh
          </button>
        </div>

        <div class="overflow-x-auto">
          <div
            v-if="loadingTable"
            class="flex justify-center items-center h-64 text-gray-400"
          >
            <i class="fa-solid fa-circle-notch fa-spin text-2xl mr-3 text-coffee-400"></i>
            載入資料中...
          </div>

          <table v-else class="w-full text-left text-sm border-collapse">
            <thead class="bg-coffee-50/50 text-gray-500 border-b border-gray-100">
              <tr>
                <th class="px-6 py-3 w-10"></th>
                <th
                  class="px-6 py-3 font-semibold text-xs uppercase tracking-wider"
                >
                  訂單編號
                </th>
                <th
                  class="px-6 py-3 font-semibold text-xs uppercase tracking-wider"
                >
                  會員
                </th>
                <th
                  class="px-6 py-3 font-semibold text-xs uppercase tracking-wider"
                >
                  訂單日期
                </th>
                <th
                  class="px-6 py-3 font-semibold text-xs uppercase tracking-wider"
                >
                  狀態 / 操作
                </th>
                <th
                  class="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right"
                >
                  訂單金額
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-if="displayOrders.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-400">
                  <i
                    class="fa-solid fa-inbox text-4xl mb-3 block opacity-30"
                  ></i>
                  目前沒有{{ currentTab === "pending" ? "待處理" : "歷史" }}訂單
                </td>
              </tr>

              <template v-for="order in displayOrders" :key="order.訂單編號">
                <tr
                  @click="toggleExpand(order)"
                  class="hover:bg-amber-50/20 transition group cursor-pointer border-l-4 border-transparent"
                  :class="{ 'border-l-amber-500 bg-amber-50/10': order.expanded }"
                >
                  <td class="px-6 py-4 text-center">
                    <i
                      class="fa-solid fa-chevron-right text-gray-300 text-xs transition-transform duration-300"
                      :class="{ 'rotate-90 text-amber-500': order.expanded }"
                    ></i>
                  </td>
                  <td class="px-6 py-4 font-mono font-medium text-coffee-900">
                    {{ order.訂單編號 }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-bold text-gray-700 text-xs">
                      {{ order.會員姓名 }}
                    </div>
                    <div class="text-[10px] text-gray-400">
                      {{ order.會員電話 }}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-gray-500 text-xs font-mono">
                    {{ formatDate(order.訂單日期) }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <span
                        class="px-2 py-1 rounded-md text-xs font-bold border inline-flex items-center gap-1.5"
                        :class="getStatusStyle(order.Status)"
                      >
                        <i :class="getStatusIcon(order.Status)"></i>
                        {{ getStatusText(order.Status) }}
                      </span>
                      <button
                        v-if="
                          currentTab === 'pending' && order.Status === 'Paid'
                        "
                        @click.stop="shipOrder(order.訂單編號)"
                        :disabled="shipping"
                        class="text-xs bg-coffee-600 text-white px-3 py-1 rounded hover:bg-coffee-700 transition shadow-sm font-bold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <i class="fa-solid fa-paper-plane"></i> 出貨
                      </button>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="text-lg font-bold text-coffee-800 font-mono">
                      NT$ {{ formatNumber(calculateOrderTotal(order)) }}
                    </div>
                  </td>
                </tr>

                <tr v-if="order.expanded" class="bg-gray-50/50 animate-fade-in">
                  <td colspan="6" class="p-0 border-b border-gray-100">
                    <div class="p-6 pl-20 relative">
                      <div
                        class="absolute left-10 top-0 bottom-0 w-0.5 bg-gray-200"
                      ></div>
                      <h4
                        class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"
                      >
                        <i class="fa-solid fa-list-ul"></i> 訂單明細 (Items)
                      </h4>
                      <div
                        class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-4"
                      >
                        <table class="w-full text-xs">
                          <thead
                            class="bg-[#f8f5f2] text-gray-500 font-bold border-b border-gray-100"
                          >
                            <tr>
                              <th class="px-4 py-2 text-left">產品名稱</th>
                              <th class="px-4 py-2 text-left">供應商</th>
                              <th class="px-4 py-2 text-right">單價</th>
                              <th class="px-4 py-2 text-center">數量</th>
                              <th class="px-4 py-2 text-right bg-amber-50/30">
                                小計
                              </th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-50">
                            <tr
                              v-for="item in order.items"
                              :key="item.序號 || item.產品編號"
                              class="hover:bg-gray-50"
                            >
                              <td class="px-4 py-2 font-medium text-coffee-900">
                                {{ formatProductName(item.產品敘述) }}
                              </td>
                              <td class="px-4 py-2 text-gray-500">
                                {{ item.供應商編號 }}
                              </td>
                              <td
                                class="px-4 py-2 text-right text-gray-600 font-mono"
                              >
                                NT$ {{ item.單價 }}
                              </td>
                              <td class="px-4 py-2 text-center font-mono">
                                {{ item.數量 }}
                              </td>
                              <td
                                class="px-4 py-2 text-right font-bold text-coffee-800 bg-amber-50/10 font-mono"
                              >
                                NT$ {{ item.總價 || item.單價 * item.數量 }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div
                        class="flex justify-between items-end text-xs text-gray-500"
                      >
                        <div class="flex flex-col gap-1">
                          <div class="flex items-center gap-2">
                            <i
                              class="fa-solid fa-location-dot text-gray-400 w-4 text-center"
                            ></i>
                            <span class="font-bold text-gray-600">送貨地址:</span>
                            {{ order.送貨地址 || "自取" }}
                          </div>
                          <div class="flex items-center gap-2">
                            <i
                              class="fa-solid fa-truck text-gray-400 w-4 text-center"
                            ></i>
                            <span class="font-bold text-gray-600">物流:</span>
                            {{ order.貨運公司名稱 || "一般配送" }}
                          </div>
                        </div>
                        <button
                          class="text-coffee-600 hover:underline font-bold flex items-center gap-1"
                        >
                          <i class="fa-solid fa-download"></i> 下載電子發票
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div
      v-if="showLowStockModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      @click.self="showLowStockModal = false"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div
          class="px-6 py-4 bg-red-500 text-white flex justify-between items-center shrink-0"
        >
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <h3 class="font-bold text-lg">庫存告急商品</h3>
          </div>
          <button @click="showLowStockModal = false" class="hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="overflow-y-auto p-6">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th class="px-4 py-2">產品編號</th>
                <th class="px-4 py-2">產品描述</th>
                <th class="px-4 py-2 text-right">當前庫存</th>
                <th class="px-4 py-2">供應商</th>
                <th class="px-4 py-2 text-right">補貨數量</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in lowStockItems"
                :key="item.產品編號"
                class="hover:bg-gray-50"
              >
                <td class="px-4 py-3 font-mono text-xs">{{ item.產品編號 }}</td>
                <td class="px-4 py-3 font-medium text-coffee-900">{{ item.產品敘述 }}</td>
                <td class="px-4 py-3 text-right font-bold text-red-600">
                  {{ item.庫存 }}
                </td>
                <td class="px-4 py-3 text-xs text-gray-500">
                  {{ item.供應商名稱 }}
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <input
                      type="number"
                      v-model="restockAmount[item.產品編號]"
                      placeholder="數量"
                      class="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:border-coffee-500 focus:outline-none"
                    /><button
                      @click="restockItem(item.產品編號)"
                      class="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 font-bold shadow-sm"
                    >
                      補貨
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";

const currentTab = ref("pending");
const loadingTable = ref(false);
const stats = ref({ totalSales: 0, pendingShipments: 0, totalMembers: 0 });
const filterYear = ref("2025");
const filterMonth = ref("12");
const pendingOrders = ref([]);
const historyOrders = ref([]);
const lowStockItems = ref([]);
const showLowStockModal = ref(false);
const restockAmount = ref({});
const shipping = ref(false);

const lastUpdated = computed(() =>
  new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })
);
const displayOrders = computed(() =>
  currentTab.value === "pending" ? pendingOrders.value : historyOrders.value
);

const toggleExpand = (order) => {
  order.expanded = !order.expanded;
};

// 🔥 新增：計算單筆訂單總額
const calculateOrderTotal = (order) => {
  if (!order.items || order.items.length === 0) return 0;
  return order.items.reduce(
    (sum, item) => sum + (item.總價 || item.單價 * item.數量),
    0
  );
};

// Fetchers
const fetchStats = async () => {
  try {
    const res = await axios.get("/api/admin/stats", {
      params: { year: filterYear.value, month: filterMonth.value },
    });
    stats.value = res.data;
  } catch (e) {
    console.error(e);
  }
};
const fetchPendingOrders = async () => {
  try {
    const res = await axios.get("/api/admin/pending-orders");
    pendingOrders.value = res.data.map((o) => ({ ...o, expanded: false }));
  } catch (e) {
    console.error(e);
  }
};
const fetchHistoryOrders = async () => {
  try {
    const res = await axios.get("/api/admin/history-orders");
    historyOrders.value = res.data.map((o) => ({ ...o, expanded: false }));
  } catch (e) {
    console.error(e);
  }
};
const fetchLowStock = async () => {
  try {
    const res = await axios.get("/api/admin/low-stock");
    lowStockItems.value = res.data;
  } catch (e) {
    console.error(e);
  }
};

const refreshTableData = async () => {
  loadingTable.value = true;
  if (currentTab.value === "pending") await fetchPendingOrders();
  else await fetchHistoryOrders();
  loadingTable.value = false;
};

// Actions
const shipOrder = async (orderId) => {
  if (!confirm(`確定出貨 ${orderId}？`)) return;
  shipping.value = true;
  try {
    await axios.post(`/api/admin/ship/${orderId}`);
    alert("出貨成功");
    refreshTableData();
    fetchStats();
  } catch (e) {
    alert("出貨失敗");
  } finally {
    shipping.value = false;
  }
};

const restockItem = async (pid) => {
  const amt = parseInt(restockAmount.value[pid]);
  if (!amt) return alert("請輸入數量");
  try {
    await axios.post("/api/admin/restock", { productId: pid, amount: amt });
    alert("補貨成功");
    restockAmount.value[pid] = "";
    fetchLowStock();
  } catch (e) {
    alert("失敗");
  }
};

// Helpers
const formatNumber = (num) => new Intl.NumberFormat("zh-TW").format(num || 0);
const formatDate = (s) =>
  s
    ? new Date(s).toLocaleString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "---";
const formatProductName = (name) => {
  if (!name) return "";
  const p = name.split(" - ");
  if (p.length < 3) return name;
  const b =
    { Ara: "阿拉比卡", Rob: "羅布斯塔", Lib: "賴比瑞亞", Exc: "伊克賽爾賽" }[
      p[0]
    ] || p[0];
  const r = { L: "淺焙", M: "中焙", D: "深焙" }[p[1]] || p[1];
  return `${b} / ${r} / ${p[2]}kg`;
};
const getStatusText = (s) =>
  ({
    Unpaid: "等待付款",
    Paid: "已付款",
    Shipped: "已出貨",
    Completed: "已完成",
  }[s] || s);
const getStatusStyle = (s) =>
  ({
    Unpaid: "bg-red-100 text-red-600 border-red-100",
    Paid: "bg-green-100 text-green-700 border-green-200",
    Shipped: "bg-blue-100 text-blue-700 border-blue-200",
  }[s] || "bg-gray-100");
const getStatusIcon = (s) =>
  ({
    Unpaid: "fa-solid fa-hourglass-half",
    Paid: "fa-solid fa-check-circle",
    Shipped: "fa-solid fa-truck-fast",
  }[s] || "fa-flag");

const openLowStockModal = () => {
  fetchLowStock();
  showLowStockModal.value = true;
};

watch([filterYear, filterMonth], () => {
  if (filterYear.value === "all") filterMonth.value = "all";
  fetchStats();
});

watch(currentTab, refreshTableData);
onMounted(() => {
  fetchStats();
  refreshTableData();
  fetchLowStock();
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>