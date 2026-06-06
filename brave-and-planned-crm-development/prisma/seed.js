import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  const ownerPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);

  // Owner
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      fullName: 'Admin (Owner)',
      passwordHash: ownerPassword,
      role: 'owner',
      isActive: true
    }
  });
  console.log('✅ Owner: admin / admin123');

  // Manager
  await prisma.user.upsert({
    where: { username: 'Elbek' },
    update: {},
    create: {
      username: 'Elbek',
      fullName: 'Elbek (Manager)',
      passwordHash: managerPassword,
      role: 'manager',
      isActive: true
    }
  });
  console.log('✅ Manager: Elbek / manager123');

  await prisma.user.upsert({
    where: { username: 'manager' },
    update: {},
    create: {
      username: 'manager',
      fullName: 'Manager',
      passwordHash: managerPassword,
      role: 'manager',
      isActive: true
    }
  });
  console.log('✅ Manager: manager / manager123');

  // Teachers (with user accounts)
  const teachersData = [
    { username: 'azizbek', fullName: 'Azizbek' },
    { username: 'oydina', fullName: 'Oydina' },
    { username: 'parvina', fullName: 'Parvina' },
    { username: 'iqboljon', fullName: 'Iqboljon' },
    { username: 'bexruz', fullName: 'Bexruz' },
    { username: 'shaxina', fullName: 'Shaxina' },
    { username: 'hasanboy', fullName: 'Hasanboy' },
    { username: 'doniyorbek', fullName: 'Doniyorbek' },
    { username: 'farangiz', fullName: 'Farangiz' },
    { username: 'ramazon', fullName: 'Ramazon' },
    { username: 'shahlo', fullName: 'Shahlo' },
    { username: 'afruzbek', fullName: 'Afruzbek' },
  ];

  for (const t of teachersData) {
    const user = await prisma.user.upsert({
      where: { username: t.username },
      update: {},
      create: {
        username: t.username,
        fullName: t.fullName,
        passwordHash: teacherPassword,
        role: 'teacher',
        isActive: true
      }
    });

    await prisma.teacher.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        fullName: t.fullName,
        phone: null,
        isActive: true,
        userId: user.id
      }
    });
  }
  console.log('✅ 12 ta o\'qituvchi yaratildi (parol: teacher123)');

  console.log('\\n=== BARCHA FOYDALANUVCHILAR ===');
  console.log('Owner:   admin / admin123');
  console.log('Manager: Elbek / manager123');
  console.log('Manager: manager / manager123');
  console.log('Teachers: azizbek, oydina, parvina, iqboljon, bexruz,');
  console.log('          shaxina, hasanboy, doniyorbek, farangiz,');
  console.log('          ramazon, shahlo, afruzbek / teacher123');
  console.log('\\nSeed muvaffaqiyatli tugadi!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
