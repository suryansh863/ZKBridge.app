import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Note: No seed data is created by default
  // The application will create real transactions as users interact with the bridge
  
  console.log('✅ Database ready for real transactions!');
  console.log('');
  console.log('💡 To test the bridge:');
  console.log('  1. Visit http://localhost:3000/bridge');
  console.log('  2. Use a real Bitcoin testnet transaction from the sample list');
  console.log('  3. Or get one from https://blockstream.info/testnet/');
  console.log('');
  console.log('🔍 To view transactions:');
  console.log('  - Visit http://localhost:3000/transactions');
  console.log('  - Or check the database with: npx prisma studio');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
