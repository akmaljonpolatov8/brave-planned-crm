import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.smsLog.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.groupStudent.deleteMany();
  await prisma.group.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();

  const ownerPassword = await bcrypt.hash("owner123", 10);
  const managerPassword = await bcrypt.hash("manager123", 10);

  const owner = await prisma.user.create({
    data: {
      fullName: "Brave and Planet Owner",
      username: "owner",
      passwordHash: ownerPassword,
      role: "OWNER",
    },
  });

  const manager1 = await prisma.user.create({
    data: {
      fullName: "Dilshod Manager",
      username: "manager1",
      passwordHash: managerPassword,
      role: "MANAGER",
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      fullName: "Malika Manager",
      username: "manager2",
      passwordHash: managerPassword,
      role: "MANAGER",
    },
  });

  const teachers = await Promise.all([
    prisma.teacher.create({ data: { firstName: "Aziza", lastName: "Karimova", phone: "+998901110101", specialty: "General English" } }),
    prisma.teacher.create({ data: { firstName: "Javohir", lastName: "Rahimov", phone: "+998901110102", specialty: "IELTS" } }),
    prisma.teacher.create({ data: { firstName: "Nilufar", lastName: "Sodiqova", phone: "+998901110103", specialty: "Kids English" } }),
  ]);

  const groupData = [
    { name: "Foundation A", schedule: "Dushanba/Chorshanba/Juma 09:00", monthlyFee: 450000, teacherId: teachers[0].id },
    { name: "Foundation B", schedule: "Seshanba/Payshanba/Shanba 11:00", monthlyFee: 450000, teacherId: teachers[0].id },
    { name: "IELTS Intensive", schedule: "Dushanba/Chorshanba/Juma 14:00", monthlyFee: 700000, teacherId: teachers[1].id },
    { name: "Kids Starter", schedule: "Seshanba/Payshanba 16:00", monthlyFee: 400000, teacherId: teachers[2].id },
    { name: "Speaking Club", schedule: "Yakshanba 10:00", monthlyFee: 300000, teacherId: teachers[1].id },
  ];

  const groups = [];
  for (const [index, group] of groupData.entries()) {
    groups.push(
      await prisma.group.create({
        data: {
          ...group,
          startDate: new Date(2026, 0, 5 + index),
        },
      }),
    );
  }

  const studentNames = [
    ["Ali", "Karimov"], ["Madina", "Nazarova"], ["Bekzod", "Toirov"], ["Zarina", "Qodirova"],
    ["Jasur", "Rahmonov"], ["Sabina", "Murodova"], ["Sardor", "Yusupov"], ["Muslima", "Tosheva"],
    ["Temur", "Azimov"], ["Shahzoda", "Ergasheva"], ["Oybek", "Rustamov"], ["Sevinch", "Turgunova"],
    ["Muhammadali", "Komilov"], ["Umida", "Raximova"], ["Asilbek", "Saidov"], ["Nozima", "Husanova"],
    ["Islom", "Qodirov"], ["Parizoda", "Shukurova"], ["Mironshoh", "Abdullayev"], ["Rayhona", "Yigitaliyeva"],
  ];

  const currentMonth = monthKey(new Date());
  const previousMonthDate = new Date();
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
  const previousMonth = monthKey(previousMonthDate);
  const attendanceDates = [1, 3, 5, 8, 10].map((d) => new Date(2026, 4, d));

  for (const [index, [firstName, lastName]] of studentNames.entries()) {
    const group = groups[index % groups.length];
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        phone: `+99893${String(1000000 + index).slice(0, 7)}`,
        parentPhone: `+99890${String(2000000 + index).slice(0, 7)}`,
        birthDate: new Date(2010 + (index % 5), index % 12, 10 + (index % 10)),
        status: index % 6 === 0 ? "DEBT" : "ACTIVE",
      },
    });

    await prisma.groupStudent.create({
      data: {
        groupId: group.id,
        studentId: student.id,
        joinedAt: new Date(2026, 0, 10 + index),
      },
    });

    const amount = group.monthlyFee;
    const isPaid = index % 4 !== 0;
    const paymentStatus = isPaid ? "PAID" : "UNPAID";

    await prisma.payment.createMany({
      data: [
        {
          studentId: student.id,
          groupId: group.id,
          month: previousMonth,
          amountDue: amount,
          amountPaid: amount,
          dueDate: new Date(previousMonthDate.getFullYear(), previousMonthDate.getMonth(), 2),
          paidAt: new Date(previousMonthDate.getFullYear(), previousMonthDate.getMonth(), 1),
          status: "PAID",
        },
        {
          studentId: student.id,
          groupId: group.id,
          month: currentMonth,
          amountDue: amount,
          amountPaid: isPaid ? amount : 0,
          dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 2),
          paidAt: isPaid ? new Date() : null,
          status: paymentStatus,
        },
      ],
    });

    for (const date of attendanceDates) {
      await prisma.attendance.create({
        data: {
          groupId: group.id,
          studentId: student.id,
          date,
          status: (index + date.getDate()) % 5 === 0 ? "ABSENT" : "PRESENT",
        },
      });
    }

    if (!isPaid) {
      await prisma.smsLog.create({
        data: {
          studentId: student.id,
          phone: student.parentPhone,
          message: `Hurmatli ota-ona, ${student.firstName} ning ${currentMonth} uchun to'lovi amalga oshirilmagan.`,
          month: currentMonth,
          provider: "TextUp",
          status: "PENDING",
        },
      });
    }
  }

  await prisma.transfer.create({
    data: {
      studentId: (await prisma.student.findFirstOrThrow()).id,
      fromGroupId: groups[0].id,
      toGroupId: groups[2].id,
      transferDate: new Date(),
      proratedAmount: 180000,
      note: "Sinov darajasi bo'yicha yuqori guruhga o'tkazildi",
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { userId: owner.id, module: "dashboard", action: "LOGIN", description: "Owner tizimga kirdi" },
      { userId: manager1.id, module: "payments", action: "UPDATE", description: "To'lov holati yangilandi" },
      { userId: manager2.id, module: "students", action: "CREATE", description: "Yangi o'quvchi qo'shildi" },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
