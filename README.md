# ☕ CoffeeBeans Order System

一個全端咖啡豆訂購系統，支援會員點餐、訂單管理及管理員後台功能。

## 🛠️ 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | Vue 3 + Vite + Tailwind CSS |
| 後端 | Node.js + Express 5 |
| 資料庫 | MySQL 8 |
| HTTP Client | Axios |

---

## 📁 專案結構

```
CoffeeProject_Handover_2025-12-15/
├── client/                  # 前端 Vue 3 應用
│   ├── src/
│   │   ├── main.js          # 應用程式入口
│   │   └── ...              # Vue 元件
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                  # 後端 Express API
│   ├── index.js             # API Server 主程式
│   ├── init_db.js           # 資料庫初始化腳本
│   ├── db_config.js         # 資料庫連線設定
│   └── package.json
├── final_project_data/      # CSV 初始資料
│   ├── products.csv         # 48 項咖啡豆商品
│   ├── member.csv           # 1,000 筆會員資料
│   ├── orders.csv           # 957 筆訂單
│   ├── items.csv            # 訂單明細
│   ├── supplier.csv         # 供應商
│   ├── deliver.csv          # 貨運公司
│   └── country.csv          # 縣市代碼
└── README.md
```

---

## ⚙️ 環境需求

- **Node.js** v18 以上（[下載](https://nodejs.org/)）
- **MySQL** 8.0 以上（建議使用 [XAMPP](https://www.apachefriends.org/) 或 [MySQL Installer](https://dev.mysql.com/downloads/installer/)）
- **Git**（選用）

---

## 🚀 安裝與啟動步驟

### 第一步：確認 MySQL 已啟動

確保 MySQL 服務在 `localhost:3306` 運行中，預設帳號為 `root`，密碼為空白。

若您的設定不同，請修改 `server/db_config.js`：

```js
module.exports = {
  host: "localhost",
  user: "root",
  password: "",   // 改成您的密碼
  port: 3306,     // 改成您的 port
};
```

---

### 第二步：初始化資料庫（**只需執行一次**）

```bash
cd server
node init_db.js
```

成功後會看到：
```
✓ Imported 48 rows into Products
✓ Database initialization completed successfully!
```

> ⚠️ 此指令會**重置**資料庫，再次執行會清空所有訂單資料。

---

### 第三步：啟動後端 Server

```bash
cd server
node index.js
```

Server 啟動後：
```
Server is running on http://localhost:3000
✓ Test user seeded: test@coffee.com / 123456
```

---

### 第四步：安裝前端依賴並啟動

```bash
cd client
npm install
npm run dev
```

前端啟動後開啟瀏覽器：**http://localhost:5173**

---

## 🔑 測試帳號

| 類型 | Email | 密碼 |
|------|-------|------|
| 一般會員 | `test@coffee.com` | `123456` |

---

## 📡 API 端點總覽

### 公開 API

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/products` | 取得商品列表（支援篩選） |
| GET | `/api/suppliers` | 取得供應商列表 |
| POST | `/api/login` | 會員登入 |

### 會員 API

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/orders/:memberId` | 取得會員訂單紀錄 |
| POST | `/api/orders` | 建立新訂單 |
| POST | `/api/pay/:orderId` | 訂單付款 |

### 管理員 API

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/admin/stats` | 取得 KPI 統計 |
| GET | `/api/admin/pending-orders` | 待處理訂單 |
| GET | `/api/admin/history-orders` | 歷史訂單 |
| POST | `/api/admin/ship/:orderId` | 標記訂單已出貨 |
| GET | `/api/admin/low-stock` | 低庫存商品 |
| POST | `/api/admin/restock` | 補貨 |

---

## 🗄️ 資料庫架構

```
Country ──────────────── Member
                           │
Supplier ── Products ── Items ── Orders ── Deliver
```

主要資料表：
- **Member**：會員資料（1,000 筆）
- **Products**：咖啡豆商品（48 項，含豆種、烘焙度資訊）
- **Orders**：訂單（支援 Unpaid / Paid / Shipped / Completed 狀態）
- **Items**：訂單明細（含數量、總價）

---

## 🧩 常見問題

**Q：商品頁面空白或無資料？**
> 請確認後端 server 已啟動（步驟三），並且資料庫已初始化（步驟二）。

**Q：資料庫連線失敗？**
> 確認 MySQL 服務運行中，並檢查 `server/db_config.js` 的設定是否正確。

**Q：`npm install` 失敗？**
> 確認 Node.js 版本 >= 18，可執行 `node -v` 確認。

---

## 📝 授權

本專案為學術作業用途。
