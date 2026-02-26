const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function testConnection() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'university_complaints',
    connectTimeout: 10000
  };

  console.log('\n🔍 Testing MySQL Connection...\n');
  console.log('Configuration:');
  console.log('  Host:', config.host);
  console.log('  User:', config.user);
  console.log('  Password:', config.password ? '***' : '(empty)');
  console.log('  Database:', config.database);
  console.log('');

  try {
    // Test connection without database first
    console.log('Step 1: Testing connection to MySQL server...');
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      connectTimeout: 10000
    });
    
    await connection.ping();
    console.log('✅ Successfully connected to MySQL server!\n');
    
    // Test database creation
    console.log('Step 2: Testing database creation...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
    console.log(`✅ Database '${config.database}' is ready!\n`);
    
    await connection.end();
    
    // Test connection with database
    console.log('Step 3: Testing connection with database...');
    const dbConnection = await mysql.createConnection({
      ...config,
      database: config.database
    });
    
    await dbConnection.ping();
    console.log('✅ Successfully connected to database!\n');
    
    await dbConnection.end();
    
    console.log('🎉 All connection tests passed!\n');
    console.log('You can now start the server with: npm run dev\n');
    
  } catch (error) {
    console.error('\n❌ Connection Test Failed!\n');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solution:');
      console.error('   MySQL server is not running or not accessible.');
      console.error('   Please start MySQL service:');
      console.error('   - Windows: Start MySQL from Services or use XAMPP/WAMP');
      console.error('   - Mac: brew services start mysql');
      console.error('   - Linux: sudo systemctl start mysql');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Solution:');
      console.error('   Invalid username or password.');
      console.error('   Please check your credentials in server/.env file');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Solution:');
      console.error('   Cannot resolve hostname.');
      console.error('   Please check DB_HOST in server/.env file');
    } else {
      console.error('\n💡 General Troubleshooting:');
      console.error('   1. Make sure MySQL is installed and running');
      console.error('   2. Check your server/.env file exists and has correct values');
      console.error('   3. Verify MySQL credentials');
      console.error('   4. Check if MySQL port (default 3306) is accessible');
    }
    
    process.exit(1);
  }
}

testConnection();
