const { PrismaClient } = require('./.prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to AWS RDS PostgreSQL!');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('Database version:', result);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
