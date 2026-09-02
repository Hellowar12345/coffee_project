const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const dbConfig = require('./db_config');

async function initDatabase() {
  let connection;

  try {
    // Connect to MySQL server (without database)
    console.log('Connecting to MySQL server on port 8889...');
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
      charset: 'utf8mb4'
    });

    console.log('Connected successfully!');

    // Create database
    console.log('Creating database coffee_db...');
    await connection.query('CREATE DATABASE IF NOT EXISTS coffee_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('Database coffee_db created or already exists.');

    // Use the database
    await connection.query('USE coffee_db');

    // Drop existing tables (in reverse order of dependencies)
    console.log('Dropping existing tables...');
    await connection.query('DROP TABLE IF EXISTS Items');
    await connection.query('DROP TABLE IF EXISTS Orders');
    await connection.query('DROP TABLE IF EXISTS Products');
    await connection.query('DROP TABLE IF EXISTS Member');
    await connection.query('DROP TABLE IF EXISTS Deliver');
    await connection.query('DROP TABLE IF EXISTS Supplier');
    await connection.query('DROP TABLE IF EXISTS Country');
    console.log('Existing tables dropped.');

    // Create tables
    console.log('Creating tables...');

    // Country table
    await connection.query(`
      CREATE TABLE Country (
        縣市代碼 VARCHAR(10) PRIMARY KEY,
        縣市名稱 VARCHAR(50)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('Table Country created.');

    // Supplier table
    await connection.query(`
      CREATE TABLE Supplier (
        供應商編號 VARCHAR(10) PRIMARY KEY,
        供應商名稱 VARCHAR(100)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('Table Supplier created.');

    // Deliver table
    await connection.query(`
      CREATE TABLE Deliver (
        貨運公司編號 VARCHAR(10) PRIMARY KEY,
        公司名稱 VARCHAR(100),
        連絡人 VARCHAR(50),
        電話 VARCHAR(20)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('Table Deliver created.');

    // Member table
    await connection.query(`
      CREATE TABLE Member (
        會員編號 VARCHAR(20) PRIMARY KEY,
        姓名 VARCHAR(50),
        電子郵件 VARCHAR(100),
        地址 VARCHAR(255),
        密碼 VARCHAR(50),
        電話 VARCHAR(20),
        縣市代碼 VARCHAR(10),
        FOREIGN KEY (縣市代碼) REFERENCES Country(縣市代碼)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('Table Member created.');

    // Products table
    await connection.query(`
      CREATE TABLE Products (
        產品編號 VARCHAR(50) PRIMARY KEY,
        產品敘述 TEXT,
        單價 INT,
        庫存 INT,
        供應商編號 VARCHAR(10),
        FOREIGN KEY (供應商編號) REFERENCES Supplier(供應商編號)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('Table Products created.');

    // Orders table
    await connection.query(`
      CREATE TABLE Orders (
        訂單編號 VARCHAR(50) PRIMARY KEY,
        會員編號 VARCHAR(20),
        貨運公司編號 VARCHAR(10),
        訂單日期 DATE,
        付款日期 DATE,
        送貨地址 VARCHAR(255),
        Status VARCHAR(20) DEFAULT 'Unpaid',
        FOREIGN KEY (會員編號) REFERENCES Member(會員編號),
        FOREIGN KEY (貨運公司編號) REFERENCES Deliver(貨運公司編號)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('Table Orders created.');

    // Items table
    await connection.query(`
      CREATE TABLE Items (
        訂單編號 VARCHAR(50),
        產品編號 VARCHAR(50),
        供應商編號 VARCHAR(10),
        序號 INT,
        數量 INT,
        總價 INT,
        PRIMARY KEY (訂單編號, 序號),
        FOREIGN KEY (訂單編號) REFERENCES Orders(訂單編號),
        FOREIGN KEY (產品編號) REFERENCES Products(產品編號),
        FOREIGN KEY (供應商編號) REFERENCES Supplier(供應商編號)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('Table Items created.');

    // Import CSV data
    console.log('\nImporting CSV data...');
    const dataPath = path.join(__dirname, '..', 'final_project_data');

    // Import order matters due to foreign key constraints
    await importCSV(connection, path.join(dataPath, 'country.csv'), 'Country');
    await importCSV(connection, path.join(dataPath, 'supplier.csv'), 'Supplier');
    await importCSV(connection, path.join(dataPath, 'deliver.csv'), 'Deliver');
    await importCSV(connection, path.join(dataPath, 'member.csv'), 'Member');
    await importCSV(connection, path.join(dataPath, 'products.csv'), 'Products');
    await importCSV(connection, path.join(dataPath, 'orders.csv'), 'Orders');
    await importCSV(connection, path.join(dataPath, 'items.csv'), 'Items');

    console.log('\n✓ Database initialization completed successfully!');

  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed.');
    }
  }
}

function importCSV(connection, filePath, tableName) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Strip BOM and other invisible characters from keys
        const cleanedRow = {};
        for (const key in row) {
          const cleanKey = key.replace(/^\uFEFF/, '').trim();
          cleanedRow[cleanKey] = row[key];
        }
        rows.push(cleanedRow);
      })
      .on('end', async () => {
        try {
          if (rows.length === 0) {
            console.log(`No data to import for ${tableName}`);
            resolve();
            return;
          }

          // Get column names from the first row
          const columns = Object.keys(rows[0]);
          const placeholders = columns.map(() => '?').join(', ');
          const columnNames = columns.join(', ');

          const query = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;

          for (const row of rows) {
            const values = columns.map(col => {
              const value = row[col];
              // Handle empty strings and NULL values
              return value === '' ? null : value;
            });
            await connection.query(query, values);
          }

          console.log(`✓ Imported ${rows.length} rows into ${tableName}`);
          resolve();
        } catch (error) {
          console.error(`Error importing ${tableName}:`, error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error(`Error reading CSV file ${filePath}:`, error);
        reject(error);
      });
  });
}

// Run the initialization
initDatabase();
