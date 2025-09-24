import { PrismaClient } from '@prisma/client';
import { BridgeDirection, TransactionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { address: '0x1234567890123456789012345678901234567890' },
    update: {},
    create: {
      address: '0x1234567890123456789012345678901234567890',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
    update: {},
    create: {
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    },
  });

  // Create sample bridge transactions
  const transaction1 = await prisma.bridgeTransaction.upsert({
    where: { id: 'sample-tx-1' },
    update: {},
    create: {
      id: 'sample-tx-1',
      direction: BridgeDirection.BITCOIN_TO_ETHEREUM,
      status: TransactionStatus.COMPLETED,
      sourceTxHash: 'btc-tx-hash-123',
      sourceAmount: '100000000', // 1 BTC in satoshis
      sourceAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      targetTxHash: '0xeth-tx-hash-456',
      targetAmount: '1000000000000000000', // 1 ETH in wei
      targetAddress: '0x1234567890123456789012345678901234567890',
      zkProof: 'sample-zk-proof-123',
      merkleProof: 'sample-merkle-proof-123',
      merkleRoot: 'sample-merkle-root-123',
      blockHeight: 800000,
      confirmations: 6,
      userId: user2.id,
    },
  });

  const transaction2 = await prisma.bridgeTransaction.upsert({
    where: { id: 'sample-tx-2' },
    update: {},
    create: {
      id: 'sample-tx-2',
      direction: BridgeDirection.ETHEREUM_TO_BITCOIN,
      status: TransactionStatus.PENDING,
      sourceTxHash: '0xeth-tx-hash-789',
      sourceAmount: '2000000000000000000', // 2 ETH in wei
      sourceAddress: '0x1234567890123456789012345678901234567890',
      targetAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      blockHeight: 18000000,
      confirmations: 2,
      userId: user1.id,
    },
  });

  const transaction3 = await prisma.bridgeTransaction.upsert({
    where: { id: 'sample-tx-3' },
    update: {},
    create: {
      id: 'sample-tx-3',
      direction: BridgeDirection.BITCOIN_TO_ETHEREUM,
      status: TransactionStatus.FAILED,
      sourceTxHash: 'btc-tx-hash-456',
      sourceAmount: '50000000', // 0.5 BTC in satoshis
      sourceAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      targetAddress: '0x1234567890123456789012345678901234567890',
      blockHeight: 799999,
      confirmations: 0,
      userId: user2.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('Created users:', { user1: user1.address, user2: user2.address });
  console.log('Created transactions:', {
    completed: transaction1.id,
    pending: transaction2.id,
    failed: transaction3.id,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

