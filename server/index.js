const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dbConfig = require('./db_config');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Create MySQL connection pool
const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  port: dbConfig.port,
  database: 'coffee_db',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection and seed test user
pool.getConnection()
  .then(async connection => {
    console.log('Database connection pool established successfully');

    // Seed test user on startup
    try {
      const testUser = {
        memberId: 'TEST_USER',
        email: 'test@coffee.com',
        password: '123456',
        name: '測試人員',
        phone: '0912-345-678',
        address: '台北市信義區測試路123號'
      };

      await connection.query(`
        INSERT INTO Member (會員編號, 電子郵件, 密碼, 姓名, 電話, 地址)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          電子郵件 = VALUES(電子郵件),
          密碼 = VALUES(密碼),
          姓名 = VALUES(姓名),
          電話 = VALUES(電話),
          地址 = VALUES(地址)
      `, [testUser.memberId, testUser.email, testUser.password, testUser.name, testUser.phone, testUser.address]);

      console.log('✓ Test user seeded: test@coffee.com / 123456');
    } catch (err) {
      console.error('Error seeding test user:', err);
    }

    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to database:', err);
  });

// ==================== Helpers ====================

const formatOrdersWithItems = (rows) => {
  const ordersMap = new Map();
  rows.forEach((row) => {
    const orderId = row.訂單編號;
    if (!ordersMap.has(orderId)) {
      ordersMap.set(orderId, {
        訂單編號: row.訂單編號,
        訂單日期: row.訂單日期,
        付款日期: row.付款日期,
        送貨地址: row.送貨地址,
        Status: row.Status,
        會員編號: row.會員編號,
        會員姓名: row.會員姓名,
        會員電話: row.會員電話,
        貨運公司名稱: row.貨運公司名稱,
        items: [],
      });
    }
    if (row.產品編號) {
      ordersMap.get(orderId).items.push({
        產品編號: row.產品編號,
        產品敘述: row.產品敘述,
        單價: row.單價,
        數量: row.數量,
        總價: row.總價,
        供應商編號: row.供應商編號,
      });
    }
  });
  return Array.from(ordersMap.values());
};

// ==================== Public API Routes ====================

// GET /api/suppliers - Return all suppliers
app.get('/api/suppliers', async (req, res) => {
  try {
    const [suppliers] = await pool.query('SELECT * FROM Supplier');
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/products - Query products with JOIN Supplier
app.get('/api/products', async (req, res) => {
  try {
    const { keyword, price_max, price_min, supplier_id, sort, bean, roast } = req.query;

    let query = `
      SELECT
        p.產品編號,
        p.產品敘述,
        p.單價,
        p.庫存,
        p.供應商編號,
        s.供應商名稱
      FROM Products p
      JOIN Supplier s ON p.供應商編號 = s.供應商編號
      WHERE 1=1
    `;

    const params = [];

    if (keyword) {
      let searchTerm = keyword;
      
      // Keyword Translation Map (User Friendly -> DB Code)
      const keywordMap = {
        'arabica': 'Ara',
        'robusta': 'Rob',
        'liberica': 'Lib',
        'excelsa': 'Exc',
        '阿拉比卡': 'Ara',
        '羅布斯塔': 'Rob',
        '賴比瑞亞': 'Lib',
        '伊克賽爾薩': 'Exc',
        'light': '- L -',
        'medium': '- M -',
        'dark': '- D -',
        '淺焙': '- L -',
        '中焙': '- M -',
        '深焙': '- D -'
      };

      // Simple replacement for mapped terms (case-insensitive check)
      const lowerKeyword = keyword.toLowerCase();
      for (const [key, value] of Object.entries(keywordMap)) {
        if (lowerKeyword.includes(key)) {
          // If we find a specific term, use the mapped value
          // Note: This simple logic replaces the *entire* concept if found, 
          // or we can replace the string. Let's do string replacement to allow mixed queries.
          // Using regex with 'gi' for case-insensitive global replacement
          const regex = new RegExp(key, 'gi');
          searchTerm = searchTerm.replace(regex, value);
        }
      }

      query += ` AND p.產品敘述 LIKE ?`;
      params.push(`%${searchTerm}%`);
    }

    if (bean && bean !== 'all') {
      const beanMap = {
        'Arabica': 'Ara',
        'Robusta': 'Rob',
        'Liberica': 'Lib',
        'Excelsa': 'Exc'
      };
      const dbBeanCode = beanMap[bean] || bean;
      query += ` AND p.產品敘述 LIKE ?`;
      params.push(`%${dbBeanCode}%`);
    }

    if (roast && roast !== 'all') {
      const roastMap = {
        'Light': '- L -',
        'Medium': '- M -',
        'Dark': '- D -'
      };
      const dbRoastCode = roastMap[roast] || roast;
      query += ` AND p.產品敘述 LIKE ?`;
      params.push(`%${dbRoastCode}%`);
    }

    if (price_min) {
      query += ` AND p.單價 >= ?`;
      params.push(parseInt(price_min));
    }

    if (price_max) {
      query += ` AND p.單價 <= ?`;
      params.push(parseInt(price_max));
    }

    if (supplier_id) {
      query += ` AND p.供應商編號 = ?`;
      params.push(supplier_id);
    }

    if (sort === 'price_asc') {
      query += ` ORDER BY p.單價 ASC`;
    } else if (sort === 'price_desc') {
      query += ` ORDER BY p.單價 DESC`;
    } else if (sort === 'newest') {
      query += ` ORDER BY p.產品編號 DESC`;
    } else {
      query += ` ORDER BY p.產品編號`;
    }

    const [products] = await pool.query(query, params);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/login - User login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Query member by email and password (plain text for demo)
    const query = `
      SELECT 會員編號, 電子郵件, 姓名, 電話, 地址
      FROM Member
      WHERE 電子郵件 = ? AND 密碼 = ?
    `;

    const [members] = await pool.query(query, [email, password]);

    if (members.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Return user object
    const user = {
      memberId: members[0].會員編號,
      email: members[0].電子郵件,
      name: members[0].姓名,
      phone: members[0].電話,
      address: members[0].地址
    };

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== Member API Routes ====================

// GET /api/orders/:memberId - Query member's order history
app.get('/api/orders/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;

    const query = `
      SELECT
        o.訂單編號,
        o.訂單日期,
        o.付款日期,
        o.送貨地址,
        o.Status,
        o.貨運公司編號,
        d.公司名稱 AS 貨運公司名稱,
        i.產品編號,
        i.供應商編號,
        i.序號,
        i.數量,
        i.總價,
        p.產品敘述,
        p.單價
      FROM Orders o
      LEFT JOIN Items i ON o.訂單編號 = i.訂單編號
      LEFT JOIN Products p ON i.產品編號 = p.產品編號
      LEFT JOIN Deliver d ON o.貨運公司編號 = d.貨運公司編號
      WHERE o.會員編號 = ?
      ORDER BY o.訂單日期 DESC, o.訂單編號, i.序號
    `;

    const [rows] = await pool.query(query, [memberId]);
    res.json(formatOrdersWithItems(rows));
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/orders - Create a new order with transaction
app.post('/api/orders', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { memberId, items, total, deliverId = 'D001', address } = req.body;

    if (!memberId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order data: memberId and items are required' });
    }

    let shippingAddress = address;

    if (!shippingAddress) {
      const [memberRows] = await pool.query('SELECT 地址 FROM Member WHERE 會員編號 = ?', [memberId]);
      if (memberRows.length === 0) {
        return res.status(404).json({ error: 'Member not found' });
      }
      shippingAddress = memberRows[0].地址;
      
      if (!shippingAddress) {
        return res.status(400).json({ error: 'Shipping address is required' });
      }
    }

    await connection.beginTransaction();

    const timestamp = Date.now().toString().slice(-5);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderId = `NOP-${timestamp}-${random}`;

    const orderQuery = `
      INSERT INTO Orders (訂單編號, 會員編號, 訂單日期, 付款日期, 送貨地址, 貨運公司編號, Status)
      VALUES (?, ?, NOW(), NULL, ?, ?, 'Unpaid')
    `;

    await connection.query(orderQuery, [
      orderId,
      memberId,
      shippingAddress,
      deliverId
    ]);

    let itemSequence = 1;
    for (const item of items) {
      const itemQuery = `
        INSERT INTO Items (訂單編號, 產品編號, 供應商編號, 序號, 數量, 總價)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      await connection.query(itemQuery, [
        orderId,
        item.productId,
        item.supplierId,
        itemSequence,
        item.quantity,
        item.price * item.quantity
      ]);

      const updateStockQuery = `
        UPDATE Products 
        SET 庫存 = 庫存 - ? 
        WHERE 產品編號 = ? AND 庫存 >= ?
      `;

      const [result] = await connection.query(updateStockQuery, [
        item.quantity,
        item.productId,
        item.quantity
      ]);

      if (result.affectedRows === 0) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }

      itemSequence++;
    }

    await connection.commit();
    console.log(`✓ Order ${orderId} created successfully for member ${memberId}`);

    res.json({
      success: true,
      orderId: orderId,
      message: 'Order placed successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  } finally {
    connection.release();
  }
});

// POST /api/pay/:orderId - Customer pay for order
app.post('/api/pay/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const query = `
      UPDATE Orders
      SET Status = 'Paid', 付款日期 = NOW()
      WHERE 訂單編號 = ? AND Status = 'Unpaid'
    `;

    const [result] = await pool.query(query, [orderId]);

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'Order not found or already paid' });
    }

    res.json({
      success: true,
      message: 'Payment successful',
      訂單編號: orderId
    });
  } catch (error) {
    console.error('Error paying for order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== Admin API Routes ====================

// GET /api/admin/stats - Return KPI statistics
app.get('/api/admin/stats', async (req, res) => {
  try {
    const { year, month } = req.query;

    let salesQuery = `
      SELECT COALESCE(SUM(i.總價), 0) AS totalSales
      FROM Items i
      JOIN Orders o ON i.訂單編號 = o.訂單編號
      WHERE 1=1
    `;
    
    const salesParams = [];

    if (year && year !== 'all') {
      salesQuery += ` AND YEAR(o.訂單日期) = ?`;
      salesParams.push(year);
    }

    if (month && month !== 'all') {
      salesQuery += ` AND MONTH(o.訂單日期) = ?`;
      salesParams.push(month);
    }

    const [salesResult] = await pool.query(salesQuery, salesParams);

    const [pendingResult] = await pool.query(`
      SELECT COUNT(*) AS pendingShipments
      FROM Orders
      WHERE 付款日期 IS NULL
    `);

    const [membersResult] = await pool.query(`
      SELECT COUNT(*) AS totalMembers
      FROM Member
    `);

    res.json({
      totalSales: salesResult[0].totalSales,
      pendingShipments: pendingResult[0].pendingShipments,
      totalMembers: membersResult[0].totalMembers,
      filters: { year, month }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/pending-orders - Unpaid/Paid orders (with details)
app.get("/api/admin/pending-orders", async (req, res) => {
  try {
    const query = `
      SELECT
        o.訂單編號, o.訂單日期, o.付款日期, o.送貨地址, o.Status,
        o.會員編號, m.姓名 AS 會員姓名, m.電子郵件, m.電話 AS 會員電話,
        o.貨運公司編號, d.公司名稱 AS 貨運公司名稱,
        i.產品編號, i.數量, i.總價, i.供應商編號,
        p.產品敘述, p.單價
      FROM Orders o
      JOIN Member m ON o.會員編號 = m.會員編號
      LEFT JOIN Deliver d ON o.貨運公司編號 = d.貨運公司編號
      LEFT JOIN Items i ON o.訂單編號 = i.訂單編號
      LEFT JOIN Products p ON i.產品編號 = p.產品編號
      WHERE o.Status IN ('Unpaid', 'Paid')
      ORDER BY FIELD(o.Status, 'Paid', 'Unpaid'), o.訂單日期 DESC
    `;
    const [rows] = await pool.query(query);
    res.json(formatOrdersWithItems(rows));
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/history-orders - Shipped/Completed orders
app.get("/api/admin/history-orders", async (req, res) => {
  try {
    const query = `
      SELECT 
        o.訂單編號, o.訂單日期, o.付款日期, o.送貨地址, o.Status, 
        o.會員編號, m.姓名 AS 會員姓名, m.電話 AS 會員電話,
        d.公司名稱 AS 貨運公司名稱,
        i.產品編號, i.數量, i.總價, i.供應商編號,
        p.產品敘述, p.單價
      FROM Orders o
      JOIN Member m ON o.會員編號 = m.會員編號
      LEFT JOIN Deliver d ON o.貨運公司編號 = d.貨運公司編號
      LEFT JOIN Items i ON o.訂單編號 = i.訂單編號
      LEFT JOIN Products p ON i.產品編號 = p.產品編號
      WHERE o.Status IN ('Shipped', 'Completed')
      ORDER BY o.訂單日期 DESC
    `;
    const [rows] = await pool.query(query);
    res.json(formatOrdersWithItems(rows));
  } catch (error) {
    console.error("Error fetching history orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/ship/:orderId - Mark order as Shipped
app.post('/api/admin/ship/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const [check] = await pool.query('SELECT Status FROM Orders WHERE 訂單編號 = ?', [orderId]);
    if (check.length === 0) return res.status(404).json({ error: 'Order not found' });
    
    if (check[0].Status === 'Unpaid') {
      return res.status(400).json({ error: 'Cannot ship unpaid orders' });
    }

    const query = `
      UPDATE Orders
      SET Status = 'Shipped'
      WHERE 訂單編號 = ?
    `;

    await pool.query(query, [orderId]);

    res.json({
      success: true,
      message: 'Order shipped successfully',
      訂單編號: orderId
    });
  } catch (error) {
    console.error('Error shipping order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/low-stock - Return products with low stock (< 20)
app.get('/api/admin/low-stock', async (req, res) => {
  try {
    const query = `
      SELECT p.產品編號, p.產品敘述, p.庫存, p.單價, s.供應商名稱
      FROM Products p
      JOIN Supplier s ON p.供應商編號 = s.供應商編號
      WHERE p.庫存 < 20
      ORDER BY p.庫存 ASC
    `;
    const [products] = await pool.query(query);
    res.json(products);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/restock - Update product stock
app.post('/api/admin/restock', async (req, res) => {
  try {
    const { productId, amount } = req.body;

    if (!productId || !amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid restock data' });
    }

    const query = `
      UPDATE Products
      SET 庫存 = 庫存 + ?
      WHERE 產品編號 = ?
    `;

    const [result] = await pool.query(query, [amount, productId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Error restocking product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== System Routes ====================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available:`);
  console.log(`  GET  /api/suppliers`);
  console.log(`  GET  /api/products`);
  console.log(`  GET  /api/orders/:memberId`);
  console.log(`  GET  /api/admin/stats`);
  console.log(`  GET  /api/admin/pending-orders`);
  console.log(`  GET  /api/admin/history-orders`);
  console.log(`  POST /api/admin/ship/:orderId`);
  console.log(`  GET  /api/admin/low-stock`);
  console.log(`  POST /api/admin/restock`);
});