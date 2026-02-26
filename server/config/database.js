const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.warn('⚠️  Warning: .env file not found. Using default values.');
  console.warn('   Please create a .env file in the server directory with your database credentials.');
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'university_complaints',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

let pool = null;

// Test database connection
async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      connectTimeout: 10000
    });
    
    await connection.ping();
    await connection.end();
    return true;
  } catch (error) {
    console.error('\n❌ Database Connection Error:');
    console.error('   Host:', dbConfig.host);
    console.error('   User:', dbConfig.user);
    console.error('   Password:', dbConfig.password ? '***' : '(empty)');
    console.error('\n   Error Details:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Make sure MySQL server is running');
      console.error('   2. Check if MySQL is installed');
      console.error('   3. Verify the host and port are correct');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Check your MySQL username and password');
      console.error('   2. Verify the user has proper permissions');
      console.error('   3. Update credentials in server/.env file');
    }
    
    return false;
  }
}

// Initialize database and create tables
async function initialize() {
  try {
    console.log('\n🔌 Testing database connection...');
    
    // Test connection first
    const canConnect = await testConnection();
    if (!canConnect) {
      throw new Error('Cannot connect to MySQL server. Please check your configuration.');
    }
    
    console.log('✅ Database connection successful!\n');

    // Create database if it doesn't exist
    console.log('📦 Creating database if not exists...');
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      connectTimeout: 10000
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await connection.end();
    console.log(`✅ Database '${dbConfig.database}' ready\n`);

    // Create connection pool
    pool = mysql.createPool({
      ...dbConfig,
      database: dbConfig.database
    });

    // Test pool connection
    await pool.query('SELECT 1');
    console.log('✅ Connection pool created\n');

    // Create tables
    console.log('📋 Creating tables...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'student') DEFAULT 'student',
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100),
        status ENUM('pending', 'in_progress', 'resolved', 'rejected', 'withdrawn') DEFAULT 'pending',
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        admin_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Complaints table ready\n');

    await pool.query(`
      ALTER TABLE complaints
      MODIFY COLUMN status ENUM('pending', 'in_progress', 'resolved', 'rejected', 'withdrawn') DEFAULT 'pending'
    `);

    // Insert demo users if they don't exist
    const [existingUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count === 0) {
      console.log('👤 Creating demo users...');
      const bcrypt = require('bcryptjs');
      const adminPassword = await bcrypt.hash('admin123', 10);
      const studentPassword = await bcrypt.hash('student123', 10);

      await pool.query(
        'INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)',
        ['admin@university.edu', adminPassword, 'admin', 'Admin User']
      );

      await pool.query(
        'INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)',
        ['john.smith@university.edu', studentPassword, 'student', 'John Smith']
      );

      console.log('✅ Demo users created successfully');
      console.log('   Admin: admin@university.edu / admin123');
      console.log('   Student: john.smith@university.edu / student123\n');
    } else {
      console.log('✅ Demo users already exist\n');
    }

    console.log('🎉 Database initialized successfully!\n');
  } catch (error) {
    console.error('\n❌ Database initialization error:');
    console.error('   Message:', error.message);
    if (error.code) {
      console.error('   Code:', error.code);
    }
    throw error;
  }
}

// Get pool (will be null until initialize is called)
function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initialize() first.');
  }
  return pool;
}

module.exports = {
  get pool() {
    return getPool();
  },
  initialize
};
