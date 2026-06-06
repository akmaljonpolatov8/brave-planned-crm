import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  const ownerPassword = await bcrypt.hash('hasanboy2024', 10);
  const managerPassword = await bcrypt.hash('manager2024', 10);

  // Owner — Hasanboy (barcha huquqlar)
  await prisma.user.upsert({
    where: { username: 'hasanboy' },
    update: {},
    create: {
      username: 'hasanboy',
      fullName: 'Hasanboy',
      passwordHash: ownerPassword,
      role: 'owner',
      isActive: true
    }
  });
  console.log('✅ Owner: hasanboy / hasanboy2024');

  // Manager — Elbek
  await prisma.user.upsert({
    where: { username: 'elbek' },
    update: {},
    create: {
      username: 'elbek',
      fullName: 'Elbek',
      passwordHash: managerPassword,
      role: 'manager',
      isActive: true
    }
  });
  console.log('✅ Manager: elbek / manager2024');

  // Manager — Doniyor
  await prisma.user.upsert({
    where: { username: 'doniyor' },
    update: {},
    create: {
      username: 'doniyor',
      fullName: 'Doniyor',
      passwordHash: managerPassword,
      role: 'manager',
      isActive: true
    }
  });
  console.log('✅ Manager: doniyor / manager2024');

  console.log('\n=== BARCHA FOYDALANUVCHILAR ===');
  console.log('Owner:   hasanboy / hasanboy2024 (barcha huquqlar)');
  console.log('Manager: elbek / manager2024');
  console.log('Manager: doniyor / manager2024');
  console.log('\nSeed muvaffaqiyatli tugadi!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
