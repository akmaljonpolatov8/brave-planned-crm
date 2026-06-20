import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function cleanPhone(raw) {
  if (!raw) return null;
  return raw.replace(/[\s\-\(\)]/g, '');
}

async function addStudents(groupName, teacherName, students) {
  let teacher = await prisma.teacher.findFirst({
    where: { fullName: { equals: teacherName, mode: 'insensitive' } }
  });
  if (!teacher) {
    teacher = await prisma.teacher.create({ data: { fullName: teacherName, isActive: true } });
  }

  let group = await prisma.group.findFirst({ where: { name: groupName } });
  if (!group) {
    group = await prisma.group.create({
      data: { name: groupName, teacherId: teacher.id, monthlyFee: 0, isActive: true, capacity: 30 }
    });
  }

  for (const s of students) {
    const phone = cleanPhone(s.phone);
    const parentPhone = cleanPhone(s.parentPhone);

    let student = null;
    if (phone) {
      student = await prisma.student.findFirst({ where: { phone } });
    }
    if (!student) {
      student = await prisma.student.create({
        data: { fullName: s.name, phone, parentPhone, status: 'active' }
      });
    }

    await prisma.groupStudent.upsert({
      where: { groupId_studentId: { groupId: group.id, studentId: student.id } },
      update: { isActive: true },
      create: { groupId: group.id, studentId: student.id, isActive: true }
    });
  }

  console.log(`✅ ${groupName} — ${students.length} o'quvchi`);
}

async function main() {
  console.log('🌱 Seeding boshlandi...\n');

  // === USERS ===
  const ownerPass = await bcrypt.hash('hasanboy2024', 10);
  const managerPass = await bcrypt.hash('manager2024', 10);

  await prisma.user.upsert({ where: { username: 'hasanboy' }, update: {}, create: { username: 'hasanboy', fullName: 'Hasanboy', passwordHash: ownerPass, role: 'owner', isActive: true } });
  await prisma.user.upsert({ where: { username: 'elbek' }, update: {}, create: { username: 'elbek', fullName: 'Elbek', passwordHash: managerPass, role: 'manager', isActive: true } });
  await prisma.user.upsert({ where: { username: 'doniyor' }, update: {}, create: { username: 'doniyor', fullName: 'Doniyor', passwordHash: managerPass, role: 'manager', isActive: true } });
  console.log('✅ Users: hasanboy (owner), elbek, doniyor (managers)\n');

  // === GURUHLAR VA O'QUVCHILAR ===

  await addStudents("Pre IELTS 16:00 (Azizbek)", "Azizbek", [
    { name: "Saitkamalova Muhlisa", phone: "+998999313245", parentPhone: "+998996042627" },
    { name: "Qurvonaliyev Masrurbek", phone: "+79197470333", parentPhone: "+998870208385" },
    { name: "Ziroatxon Raxmonova", phone: "+998971042565", parentPhone: "+998993686280" },
    { name: "Shafoatxon Jo'raxonova", phone: "+998975717580", parentPhone: "+998773304805" },
    { name: "Alinazarov Shoxjahon", phone: "+998993211555", parentPhone: "+998995155474" },
    { name: "Munira Samijonova", phone: "+998993165580", parentPhone: "+998975205818" },
    { name: "Isroilov Mustafo", phone: "+79871545357", parentPhone: "+998507098718" },
    { name: "Odiljonov Asadbek", phone: "+998945017160", parentPhone: "+998999789606" },
    { name: "Ma'sudova Madina", phone: null, parentPhone: "+998931064788" },
    { name: "Jamoldinova Sevinch", phone: "+998940808955", parentPhone: "+905384326294" },
    { name: "Kasymbayeva Saginabonu", phone: "+79060948444", parentPhone: "+998950972989" },
    { name: "Rozikova Diana", phone: "+998992218500", parentPhone: "+998940283301" },
    { name: "Mahmudaliyeva Mushtariy", phone: "+998934995865", parentPhone: "+998500702112" },
  ]);

  await addStudents("Pre IELTS 14:00 (Azizbek)", "Azizbek", [
    { name: "Rahimjonova Gulsevar", phone: "+998771824582", parentPhone: "+998958595982" },
    { name: "Jumanazarov Omadbek", phone: "+998943044777", parentPhone: "+998958298991" },
    { name: "G'ulomjonov Elzodbek", phone: "+79490736849", parentPhone: "+998932685828" },
    { name: "Yuldashev Barkamol", phone: "+998995355060", parentPhone: "+998939135773" },
    { name: "Qurbonova Zilola", phone: "+998777810210", parentPhone: "+998779726585" },
    { name: "Xabibullayeva Saida", phone: "+998944892886", parentPhone: "+998930501389" },
    { name: "Olimjonova Mahsudaxon", phone: "+998975938885", parentPhone: "+998933628884" },
    { name: "Latipov Faxriyor", phone: "+79490251450", parentPhone: "+998997667882" },
    { name: "Valijonova Asila", phone: "+998937781582", parentPhone: "+998944118382" },
    { name: "Abdualiyeva Laylo", phone: "+998774215383", parentPhone: "+998771491383" },
    { name: "Ismonaliyeva Zarnigor", phone: "+79998553618", parentPhone: "+998937747185" },
    { name: "Tulkinov Doston", phone: "+998701100086", parentPhone: "+998886951525" },
    { name: "Rahimjonov Muhammad", phone: "+998944470017", parentPhone: "+998771271101" },
    { name: "Xoshimaliyeva Mashhura", phone: "+998505224489", parentPhone: "+998998870392" },
    { name: "Mirsaidboyeva Shahrizoda", phone: "+998958308691", parentPhone: "+998998108691" },
    { name: "Orifjonova Kumush", phone: "+998935242286", parentPhone: "+998996014057" },
    { name: "Inomjonova Mohidil", phone: "+998933721155", parentPhone: "+998977761402" },
    { name: "Xaliljonov Ozodbek", phone: "+998999750636", parentPhone: "+998997220636" },
    { name: "Sobirjonova Uljanoy", phone: "+998503018479", parentPhone: "+998931268479" },
    { name: "Usmonova Dilnoza", phone: "+998945347626", parentPhone: "+998509779875" },
    { name: "Xonazarov Javohir", phone: "+998936789115", parentPhone: "+998507739115" },
  ]);

  await addStudents("Beginner 9:00 (Azizbek)", "Azizbek", [
    { name: "Azamjonov Og'abek", phone: "+998945013659", parentPhone: "+998949218288" },
    { name: "Latipov Diyorbek", phone: "+79626924563", parentPhone: "+998940549454" },
    { name: "Yoqubjonov Shodiyorbek", phone: "+77772938408", parentPhone: "+998505090889" },
    { name: "Sidiqboyeva Durdona", phone: "+77781821689", parentPhone: "+998505062889" },
    { name: "Nosiraliyev Omadbek", phone: "+998932698808", parentPhone: "+998948130550" },
    { name: "Suvonova Ma'suma", phone: "+998500209015", parentPhone: "+998942981505" },
    { name: "Xayitova Ziyoda", phone: "+998930936676", parentPhone: "+998503074960" },
    { name: "Norboyeva Oyshamalak", phone: "+77770306787", parentPhone: "+998937051487" },
    { name: "Ergashboyev Saidjamol", phone: "+79626285646", parentPhone: "+998998371387" },
    { name: "Usmonaliyeva Malika", phone: "+998972556526", parentPhone: "+998946726794" },
    { name: "Abduqodirova Jamilabonu", phone: "+998997942329", parentPhone: "+998999102704" },
    { name: "Inomov Ramzan", phone: "+998338710777", parentPhone: "+998939154777" },
    { name: "Abdullayev Dilyorbek", phone: "+79163220028", parentPhone: "+998996512022" },
    { name: "Islomjonova Shabbona", phone: "+998972315888", parentPhone: "+998990075989" },
    { name: "Muhammadyusuf Toshmatov", phone: "+998935781212", parentPhone: "+998998503504" },
    { name: "Tulqinova Madina", phone: "+998701100086", parentPhone: "+998886951525" },
    { name: "Mahmudova Mehribon", phone: null, parentPhone: "+998779716704" },
    { name: "Asadbek Alijonov", phone: null, parentPhone: "+998930367687" },
    { name: "Buyukmirzo Orifjonov", phone: "+998913547000", parentPhone: "+998999742030" },
  ]);

  await addStudents("Beginner 14:00 (Oydina)", "Oydina", [
    { name: "Axmadjonova Mushtariy", phone: "+998942003506", parentPhone: null },
    { name: "Asadillayeva Xushro'y", phone: "+998932168687", parentPhone: null },
    { name: "Axmadaliyeva Xonzoda", phone: "+998777337408", parentPhone: null },
    { name: "Xoldaraliyeva Jasmina", phone: "+998943037783", parentPhone: null },
    { name: "Inomjonov Ravshanbek", phone: "+998972567956", parentPhone: null },
    { name: "Ilhomjonova Sojida", phone: "+998956414515", parentPhone: null },
    { name: "Islomova Zarina", phone: "+998950010168", parentPhone: null },
    { name: "Nabijonov Xushnudbek", phone: "+998508558381", parentPhone: null },
    { name: "Erkinboyeva Shohista", phone: "+998978258587", parentPhone: null },
    { name: "Madaminjonova Mumtoz begim", phone: "+998945092959", parentPhone: null },
    { name: "Xaydaraliyeva Mahorat", phone: "+998507245282", parentPhone: null },
    { name: "Asadaliyeva Nastarin", phone: "+998932168687", parentPhone: null },
    { name: "Jo'rayev Azizbek", phone: "+998770991152", parentPhone: null },
    { name: "Nishonaliyeva Guljahon", phone: "+998942762487", parentPhone: null },
    { name: "Xamdamjonova Shodiyona", phone: "+998941506094", parentPhone: null },
    { name: "Satinboyev Javohir", phone: "+998973764046", parentPhone: null },
    { name: "Nabijonova Sevinch", phone: "+998773350981", parentPhone: null },
    { name: "Ergashaliyev Azizbek", phone: "+998913442009", parentPhone: null },
    { name: "Valijonov Elbek", phone: "+998200088018", parentPhone: null },
    { name: "Negmatillayeva Farzona", phone: "+998505026484", parentPhone: null },
    { name: "Rahimjonova Ezoza", phone: "+998930696828", parentPhone: null },
    { name: "Zokiraliyev Muhammad", phone: "+998945715581", parentPhone: null },
    { name: "Azizxonova Mubina", phone: "+998939262233", parentPhone: null },
    { name: "Holdaraliyeva Madina", phone: "+998994308725", parentPhone: null },
    { name: "Imomaliyeva Gulziyo", phone: "+998941514007", parentPhone: null },
  ]);

  await addStudents("Beginner 16-18 (Parvina)", "Parvina", [
    { name: "Bernara", phone: "+998994068206", parentPhone: null },
    { name: "Jannat", phone: "+998332830007", parentPhone: null },
    { name: "Shahrizoda", phone: "+998508786535", parentPhone: null },
    { name: "Gulsevar", phone: "+998990014486", parentPhone: null },
    { name: "Shohjaxon", phone: "+998501111811", parentPhone: null },
    { name: "Abdulbosit", phone: "+998951493809", parentPhone: null },
    { name: "Xusanboy", phone: "+998509982616", parentPhone: null },
    { name: "Mushtariy", phone: "+998996054705", parentPhone: null },
    { name: "Shirin", phone: "+998953171591", parentPhone: null },
  ]);

  await addStudents("Kids 14:00 (Parvina)", "Parvina", [
    { name: "Mamurova Mubinaxon", phone: "+998932643537", parentPhone: null },
    { name: "Shokirjonov Abdulloh", phone: "+998996999212", parentPhone: null },
    { name: "Ergashaliyev Jahongir", phone: "+998943006703", parentPhone: null },
    { name: "Odiljonova Malikabonu", phone: "+998999763187", parentPhone: null },
    { name: "Javlonov Javohir", phone: "+79310081883", parentPhone: null },
    { name: "Juraboyeva Diyora", phone: "+998958535558", parentPhone: null },
    { name: "Xolmatjonov Diyorbek", phone: "+998952867747", parentPhone: null },
    { name: "Zokiraliyev Xafizulloh", phone: "+998509096882", parentPhone: null },
    { name: "Isomiddinov Muhammadboburxo'ja", phone: "+998994600086", parentPhone: null },
    { name: "Abdulqosimov Durbek", phone: "+998942145552", parentPhone: null },
    { name: "Saydazimova Ominaxon", phone: "+998936700312", parentPhone: null },
    { name: "A'zamboy", phone: "+998949225521", parentPhone: null },
    { name: "Boxodirov Dostonbek", phone: "+998939116979", parentPhone: null },
  ]);

  await addStudents("Intermediate 14-16 (Iqboljon)", "Iqboljon", [
    { name: "Sobitxo'jayev Abdulaziz", phone: "+998704745074", parentPhone: null },
    { name: "Abduqahhorova Hadichabonu", phone: "+998997227034", parentPhone: null },
    { name: "Ikromaliyeva Durdona", phone: "+998941632343", parentPhone: null },
    { name: "Ma'murova Hadyabonu", phone: "+998972050400", parentPhone: null },
    { name: "Ahmadjonova Fotima", phone: null, parentPhone: null },
    { name: "Ahmadjonova Zuxra", phone: "+998948561974", parentPhone: null },
    { name: "Abdumuminova Gulhayo", phone: "+998941762687", parentPhone: null },
    { name: "Nuritdinova Sevinchxon", phone: "+998772240890", parentPhone: null },
    { name: "Tulaganov Rumid", phone: "+998509007586", parentPhone: null },
    { name: "Qahramonov Omadbek", phone: "+998942091714", parentPhone: null },
    { name: "Nishonboyev Saidjon", phone: "+998938727806", parentPhone: null },
    { name: "Hamidxonov Yusufxon", phone: "+998945935655", parentPhone: null },
    { name: "Sobirov Inomjon", phone: "+998991412609", parentPhone: null },
    { name: "Erkinov Jonibek", phone: "+998940073444", parentPhone: null },
    { name: "Tursinaliyeva Shahlo", phone: "+998995162919", parentPhone: null },
  ]);

  await addStudents("Middle (Bexruz)", "Bexruz", [
    { name: "Sobitxo'jayev Abdulaziz", phone: "+998704745074", parentPhone: null },
    { name: "Abduqahhorova Hadichabonu", phone: "+998997227034", parentPhone: null },
    { name: "Ikromaliyeva Durdona", phone: "+998941632343", parentPhone: null },
    { name: "Ma'murova Hadyabonu", phone: "+998972050400", parentPhone: null },
    { name: "Ahmadjonova Fotima", phone: null, parentPhone: null },
    { name: "Ahmadjonova Zuxra", phone: "+998948561974", parentPhone: null },
    { name: "Abdumuminova Gulhayo", phone: "+998941762687", parentPhone: null },
    { name: "Nuritdinova Sevinchxon", phone: "+998772240890", parentPhone: null },
    { name: "Tulaganov Rumid", phone: "+998509007586", parentPhone: null },
    { name: "Qahramonov Omadbek", phone: "+998942091714", parentPhone: null },
    { name: "Nishonboyev Saidjon", phone: "+998938727806", parentPhone: null },
    { name: "Hamidxonov Yusufxon", phone: "+998945935655", parentPhone: null },
    { name: "Sobirov Inomjon", phone: "+998991412609", parentPhone: null },
    { name: "Erkinov Jonibek", phone: "+998940073444", parentPhone: null },
    { name: "Tursunaliyeva Shahlo", phone: "+998995162919", parentPhone: null },
    { name: "Muhidjonova Oygul", phone: "+998940567306", parentPhone: null },
    { name: "Dilmurodova Mushtariy", phone: "+998941525277", parentPhone: null },
    { name: "Muhammadaliyeva Dilbar", phone: "+998993014878", parentPhone: null },
    { name: "Haydarova Dilsora", phone: "+998945090613", parentPhone: null },
    { name: "Nuriddinova Dinora", phone: "+998942548009", parentPhone: null },
    { name: "Turdaliyeva Marjon", phone: "+998973740882", parentPhone: null },
    { name: "Normatjonov Islombek", phone: "+998993907286", parentPhone: null },
    { name: "Saidnazarov Shahzodbek", phone: "+998509094505", parentPhone: null },
    { name: "Tohirjonov Otabek", phone: "+998993235616", parentPhone: null },
    { name: "Yo'ldashaliyeva Mohichehra", phone: "+998948832387", parentPhone: null },
    { name: "Raximjonova Begoyim", phone: "+998777332030", parentPhone: null },
    { name: "Jamoliddinova Oygul", phone: "+998996112270", parentPhone: null },
    { name: "Hamidullayev Otabek", phone: "+998975704141", parentPhone: null },
    { name: "Isagaliyev Bobur", phone: "+998950199242", parentPhone: null },
    { name: "Po'latova Mushtariy", phone: "+998947043050", parentPhone: null },
    { name: "Tillayeva Ruxshona", phone: "+998884049007", parentPhone: null },
    { name: "Rasuljonova Kamola", phone: "+998336240589", parentPhone: null },
    { name: "Muradaliyeva Nozima", phone: "+998932241195", parentPhone: null },
    { name: "Toshpo'latov Aziz", phone: "+998931780085", parentPhone: null },
    { name: "To'ychibayev Afzalbek", phone: "+998949848050", parentPhone: null },
    { name: "Muhammadov Shamshod", phone: "+998949855887", parentPhone: null },
    { name: "Yorqinbekov Qilichbek", phone: "+998905531798", parentPhone: null },
    { name: "Madalimov Samandar", phone: "+998994835957", parentPhone: null },
    { name: "Ismonjonova Bibisora", phone: "+998995123710", parentPhone: null },
    { name: "Sobitova Rano", phone: "+998973198577", parentPhone: null },
    { name: "Qobilova Bekzoda", phone: "+998995215889", parentPhone: null },
    { name: "Mamurjonova Odina", phone: "+998951920486", parentPhone: null },
    { name: "Xoldarboyeva Shukrona", phone: "+998945056552", parentPhone: null },
    { name: "Mamadaliyeva Shodiya", phone: "+998505997585", parentPhone: null },
    { name: "Xolmamatova Shohruza", phone: "+998934072552", parentPhone: null },
    { name: "Abdulhakimova Ziyoda", phone: "+998939421575", parentPhone: null },
    { name: "Anvarjonova Diyora", phone: "+998972592559", parentPhone: null },
    { name: "Umirzakov Muhammadzohid", phone: "+998507766200", parentPhone: null },
    { name: "Hurmataliyev Athamjon", phone: "+998943181215", parentPhone: null },
    { name: "Asatillayeva Dilnura", phone: "+998505088700", parentPhone: null },
    { name: "Komiljonova Hadicha", phone: "+998333672000", parentPhone: null },
  ]);

  await addStudents("IELTS 1 (Bexruz)", "Bexruz", [
    { name: "Rahimjonova Marvarid", phone: "+998952720662", parentPhone: null },
    { name: "Dilsuz", phone: "+998949900086", parentPhone: null },
    { name: "Oysuluv", phone: "+998700606722", parentPhone: null },
    { name: "Begoim", phone: "+998952715050", parentPhone: null },
    { name: "Muhhayo", phone: "+998950928883", parentPhone: null },
    { name: "Jamoliddin", phone: "+998994778883", parentPhone: null },
    { name: "Farangiz", phone: "+998504401715", parentPhone: null },
    { name: "Shahriyor Abdukarimov", phone: "+998777845779", parentPhone: null },
    { name: "Xushvaktjon", phone: "+998936788797", parentPhone: null },
    { name: "Rasuljonova Sarvara", phone: "+998777310687", parentPhone: null },
    { name: "Hamida", phone: "+998772744287", parentPhone: null },
    { name: "Nozila", phone: "+998700604330", parentPhone: null },
    { name: "Gulnoza", phone: "+998958543909", parentPhone: null },
    { name: "Ganijon", phone: "+998701067282", parentPhone: null },
    { name: "Azizbek", phone: "+998971970210", parentPhone: null },
    { name: "Feruza", phone: "+998970854582", parentPhone: null },
    { name: "Abduxoliqov Faxriyor", phone: "+998937400314", parentPhone: null },
    { name: "Salohiddin", phone: "+998501777083", parentPhone: null },
    { name: "Allommurod", phone: "+998506772901", parentPhone: null },
    { name: "Madina", phone: "+998977908588", parentPhone: null },
    { name: "Asrorjon", phone: "+998950725585", parentPhone: null },
    { name: "Fayzullo", phone: "+998502073211", parentPhone: null },
    { name: "Nozima", phone: "+998939388188", parentPhone: null },
    { name: "Xayrullo", phone: "+998950491881", parentPhone: null },
    { name: "Ozodbek", phone: "+998955893089", parentPhone: null },
    { name: "Muyassar", phone: "+998776331005", parentPhone: null },
    { name: "Xusanboy", phone: "+998996573004", parentPhone: null },
    { name: "Dilrabo", phone: "+998943047938", parentPhone: null },
    { name: "Tulkinjon", phone: "+998934078377", parentPhone: null },
    { name: "Xusniiddin", phone: "+998949072610", parentPhone: null },
    { name: "Nazirjon", phone: "+998944496333", parentPhone: null },
    { name: "Mohinur", phone: "+998931224410", parentPhone: null },
    { name: "Feruza2", phone: "+998939253336", parentPhone: null },
    { name: "Muhammaddiyo", phone: "+998777017476", parentPhone: null },
    { name: "Rohilaxon", phone: "+998997227271", parentPhone: null },
    { name: "Xislatbek", phone: "+998509798211", parentPhone: null },
    { name: "Risalatxon", phone: "+998940904250", parentPhone: null },
    { name: "Bexzodbek", phone: "+998933718209", parentPhone: null },
    { name: "Ruxshona", phone: "+998888587828", parentPhone: null },
    { name: "Erkinov Faxriyor", phone: "+998951611241", parentPhone: null },
    { name: "Zilola", phone: "+998931259251", parentPhone: null },
    { name: "Matlyuba", phone: "+998934269251", parentPhone: null },
    { name: "Akramjon", phone: "+998999709343", parentPhone: null },
    { name: "Oygul", phone: "+998500972474", parentPhone: null },
    { name: "Nafisa", phone: "+998331332474", parentPhone: null },
    { name: "Muxtorjonova Ruxshona", phone: "+998705251308", parentPhone: null },
    { name: "Pariizod Alijonova", phone: "+998950273202", parentPhone: null },
    { name: "Shodiyona", phone: "+998945253518", parentPhone: null },
    { name: "Shaxzodbek", phone: "+998950134887", parentPhone: null },
    { name: "Zokiraliyeva Mushtariy", phone: "+998956423233", parentPhone: null },
    { name: "Muhitjonov Ibrohim", phone: "+998509981045", parentPhone: null },
    { name: "Farxodjonova Sarvinoz", phone: "+998996020760", parentPhone: null },
    { name: "Xolmuhammedova Oydina", phone: "+998772762251", parentPhone: null },
    { name: "Abdumutolova Mubina", phone: "+998948670902", parentPhone: null },
    { name: "Yandashev Obidon", phone: "+998945059500", parentPhone: null },
    { name: "Axmedova Mushtariy", phone: "+998978274757", parentPhone: null },
    { name: "Raxmataliyeva Sarvara", phone: "+998885700776", parentPhone: null },
  ]);

  await addStudents("Kids 14-16 (Shaxina)", "Shaxina", [
    { name: "Athamjonov Muhammadxon", phone: "+998940155242", parentPhone: null },
    { name: "Orifjonova Ozoda", phone: "+998771498894", parentPhone: null },
    { name: "Baxtiyor Bexruzbek", phone: "+998975915056", parentPhone: null },
    { name: "Yo'ldashaliyev Afruzbek", phone: "+998883707553", parentPhone: null },
    { name: "Zokirov Xojiakbar", phone: "+998996161020", parentPhone: null },
    { name: "Shuxrataliyeva Shirin", phone: "+998949084557", parentPhone: null },
    { name: "Samijonova Zarina", phone: "+998940158587", parentPhone: null },
    { name: "Baxromjonov Shohjahon", phone: "+8882167660", parentPhone: null },
    { name: "Taslimboyev Sardorbek", phone: "+998940660087", parentPhone: null },
    { name: "Mustafo", phone: "+998945937693", parentPhone: null },
    { name: "Abdulloh", phone: "+998994381463", parentPhone: null },
  ]);

  await addStudents("Multilevel (Hasanboy)", "Hasanboy", [
    { name: "Yusufjonov Shuhratbek", phone: "+998996038781", parentPhone: null },
    { name: "Bunyod", phone: "+998884677766", parentPhone: null },
    { name: "Turgunpo'latov Firdavs", phone: "+998998058929", parentPhone: null },
    { name: "Olimjonov Asilbek", phone: "+998938327232", parentPhone: null },
    { name: "Botirova Humora", phone: "+998950368688", parentPhone: null },
    { name: "Abdullayeva Mexruza", phone: "+998501993088", parentPhone: null },
    { name: "Holmirzayev Shohruh", phone: "+998948571287", parentPhone: null },
    { name: "Rahmataliyev Ortigali", phone: "+998942761077", parentPhone: null },
    { name: "Jabaraliyeva Xazinabonu", phone: "+998932994309", parentPhone: null },
    { name: "Olimjonova Mehribon", phone: "+998950758855", parentPhone: null },
    { name: "Ibrohimova Nigora", phone: "+998777532283", parentPhone: null },
    { name: "Mominjonova Nodira", phone: "+998946065383", parentPhone: null },
    { name: "Mamasharipova Durdona", phone: "+998943012480", parentPhone: null },
    { name: "Raxmataliyev Muhammadxon", phone: "+998941549178", parentPhone: null },
    { name: "Pirimnazarov Asilbek", phone: "+998972231282", parentPhone: null },
    { name: "Saminjonov Otabek", phone: "+998975200509", parentPhone: null },
    { name: "Quldashov Obodjon", phone: "+998942066996", parentPhone: null },
    { name: "Muhammadjonova Xurshida", phone: "+998952166486", parentPhone: null },
    { name: "Yulchiyev Baxovuddin", phone: "+998502041305", parentPhone: null },
    { name: "Kamoliddinova Xusnora", phone: "+998936746068", parentPhone: null },
  ]);

  await addStudents("Beginner 14:00 (Farangiz)", "Farangiz", [
    { name: "Rahmnazarova Shalola", phone: "+998704731444", parentPhone: null },
    { name: "Tohirjonova Shohruza", phone: "+998993080887", parentPhone: null },
    { name: "Azizova Billura", phone: "+998700113492", parentPhone: null },
    { name: "Murodov Xolmatjon", phone: "+998943451440", parentPhone: null },
    { name: "Nuraliyev Asadbek", phone: "+998936418889", parentPhone: null },
    { name: "Ravshanboyev Begzod", phone: "+998943038588", parentPhone: null },
    { name: "Sotvoliyev Xusanboy", phone: "+998884064446", parentPhone: null },
    { name: "Erkinjonov Behruzbek", phone: "+998975202750", parentPhone: null },
    { name: "Sodiqjonov Bektemur", phone: "+998945731887", parentPhone: null },
    { name: "Rahimjonov Doston", phone: "+998500099332", parentPhone: null },
    { name: "Ergashev Boburjon", phone: "+998950191180", parentPhone: null },
    { name: "Aminjonov Mustafo", phone: "+998943029942", parentPhone: null },
    { name: "Saloyiddinov Muhriddin", phone: "+998941506627", parentPhone: null },
    { name: "Esonaliyev Ibrohim", phone: "+998940554504", parentPhone: null },
    { name: "Sobitova Mahmuda", phone: "+998943048941", parentPhone: null },
    { name: "Shermatov Mirjalol", phone: "+998957118183", parentPhone: null },
    { name: "Qurbonazarova Shahlo", phone: "+998949080310", parentPhone: null },
    { name: "Rohataliyev Lazizbek", phone: "+998502228668", parentPhone: null },
    { name: "Rahmonqulov Turgunboy", phone: "+998949732995", parentPhone: null },
    { name: "Hayrulloxonov Amirxon", phone: "+998937052253", parentPhone: null },
    { name: "Ikromaliyev Nurziyod", phone: "+998943099477", parentPhone: null },
    { name: "Rustamaliyev Ravshanbek", phone: "+998772873060", parentPhone: null },
    { name: "Bahramjonov Muhammadiyor", phone: "+998881438683", parentPhone: null },
    { name: "Amduxoshimov Omadbek", phone: "+998958705089", parentPhone: null },
    { name: "Abduraximova Gulsanam", phone: "+998933097990", parentPhone: null },
    { name: "Farhodjonova Saida", phone: "+998500258355", parentPhone: null },
    { name: "Boboxo'jayeva Shohruza", phone: "+998501004678", parentPhone: null },
    { name: "Valijonova Sug'diyona", phone: "+998940466576", parentPhone: null },
    { name: "Rahimjonova Fazilat", phone: "+998885748590", parentPhone: null },
    { name: "Rahimjonov Abduhali", phone: "+998885748590", parentPhone: null },
    { name: "Mamasharipov Asadbek", phone: "+998945714204", parentPhone: null },
  ]);

  await addStudents("Elementary 16-18 (Doniyorbek)", "Doniyorbek", [
    { name: "Foziljanova Dilnoza", phone: "+998503018208", parentPhone: null },
    { name: "Boxodirjonov Javohir", phone: "+998942212292", parentPhone: null },
    { name: "Mahamjonova Rano", phone: "+998938105410", parentPhone: null },
    { name: "Yulchiyeva Gulchehra", phone: "+998941708914", parentPhone: null },
    { name: "Abdulhakimova Setora", phone: "+998992706890", parentPhone: null },
    { name: "Oripova Rano", phone: "+998700227790", parentPhone: null },
    { name: "Abdullayev Davron", phone: "+998992720758", parentPhone: null },
    { name: "Rahimjonov Baxtiyor", phone: "+998930535909", parentPhone: null },
    { name: "Ergashev Xudoyberdi", phone: "+998505897773", parentPhone: null },
    { name: "Sheraliyeva Zebo", phone: "+905423346478", parentPhone: null },
    { name: "Turg'unboyev Alimardon", phone: "+998932605085", parentPhone: null },
    { name: "Ergashaliyev Ibrohim", phone: "+998931518283", parentPhone: null },
  ]);

  await addStudents("Elementary 14-16 (Doniyorbek)", "Doniyorbek", [
    { name: "Akbaraliyev Og'abek", phone: "+998994094509", parentPhone: null },
    { name: "Azatbayrova Mumtazabegim", phone: "+998501880480", parentPhone: null },
    { name: "Nazaraliyev Muhammadzohid", phone: "+998933151485", parentPhone: null },
    { name: "Rasuljonova Durdona", phone: "+998882580488", parentPhone: null },
    { name: "Ikromaliyeva Asema", phone: "+998936716801", parentPhone: null },
    { name: "Soataliyev Bekmurod", phone: "+998883791779", parentPhone: null },
    { name: "Butayev Suhrobjon", phone: "+998932435808", parentPhone: null },
    { name: "Xakimxonov Olimjon", phone: "+998941498587", parentPhone: null },
    { name: "Yaqubjonov Muhammadziyo", phone: "+998990122644", parentPhone: null },
    { name: "Sultanova Shukurona", phone: "+998940184868", parentPhone: null },
    { name: "Raxmonov Burxonjon", phone: "+998939421172", parentPhone: null },
    { name: "Nurmatov Alibek", phone: "+998938648070", parentPhone: null },
    { name: "Fazliddin", phone: "+998702335580", parentPhone: null },
  ]);

  await addStudents("Intermediate 14-16 (Farangiz)", "Farangiz", [
    { name: "Davlataliyeva Marjona", phone: "+998940721150", parentPhone: null },
    { name: "G'aniyev Tangriyor", phone: "+998702332603", parentPhone: null },
    { name: "Abdulxayeva Mubina", phone: "+998993922288", parentPhone: null },
    { name: "Yakubaliyev Ilg'orbek", phone: "+998958142886", parentPhone: null },
    { name: "Alimov Behruz", phone: "+998979232386", parentPhone: null },
    { name: "Mahmmudjonov Abrorjon", phone: "+998949976686", parentPhone: null },
    { name: "Rahimjonov Yusufbek", phone: "+998958003372", parentPhone: null },
    { name: "Sodirjonov Islomjon", phone: "+998999095499", parentPhone: null },
    { name: "Usmonqulov Umidjon", phone: "+998950541884", parentPhone: null },
    { name: "G'ayratov Nurshodbek", phone: "+998701066494", parentPhone: null },
    { name: "Xolmatjonova Oydin", phone: "+998952867747", parentPhone: null },
    { name: "Polatjonov Asadbek", phone: "+998940888507", parentPhone: null },
    { name: "Otaxonov Mirzakarim", phone: "+998947759884", parentPhone: null },
    { name: "Tolaganov Elbek", phone: "+998774453373", parentPhone: null },
    { name: "Xolmatov Botirjon", phone: "+998945070004", parentPhone: null },
    { name: "Mamanazarova Jasmina", phone: "+998937934001", parentPhone: null },
    { name: "Sobitova Madinaxon", phone: "+998931023276", parentPhone: null },
    { name: "Yuldashaliyev Firdavs", phone: "+998934940687", parentPhone: null },
    { name: "Olimov Bekzod", phone: "+998959273434", parentPhone: null },
    { name: "Solijonov Oybek", phone: "+998995117709", parentPhone: null },
    { name: "Sobitov Ulug'bek", phone: "+998772021402", parentPhone: null },
    { name: "Erkinboyev Mirjamol", phone: "+998995175227", parentPhone: null },
    { name: "Toshmatova Dilrabo", phone: "+998507791556", parentPhone: null },
  ]);

  await addStudents("Elementary 14-16 (Ramazon)", "Ramazon", [
    { name: "Yuldashev Izzatbek", phone: "+998913553775", parentPhone: null },
    { name: "Rahbarov Sardorbek", phone: "+998972571710", parentPhone: null },
    { name: "Yunashboyeva Mehribon", phone: "+998951393931", parentPhone: null },
    { name: "Davlataliyev Muhammadali", phone: "+998996916765", parentPhone: null },
    { name: "Xabibullayev Ozodbek", phone: null, parentPhone: null },
    { name: "Ahmedov Hikmatillo", phone: "+998993928716", parentPhone: null },
    { name: "Axadjonova Muazzam", phone: "+998995318607", parentPhone: null },
    { name: "Elmurodova Nargiza", phone: "+998940284400", parentPhone: null },
    { name: "Abdurasulova Bibisora", phone: "+998930894424", parentPhone: null },
    { name: "Shokirjonov Shohjahon", phone: "+998943063956", parentPhone: null },
    { name: "To'ychiboyeva Oydina", phone: "+998888168784", parentPhone: null },
    { name: "Abdullayeva Istiqlola", phone: "+998936037908", parentPhone: null },
    { name: "Rasuljonova Jasmina", phone: "+998959735157", parentPhone: null },
    { name: "Muhiddinov Behruzbek", phone: "+998911821434", parentPhone: null },
    { name: "Xakimova Gulnoza", phone: "+998959575101", parentPhone: null },
    { name: "Usmonov Alisher", phone: "+998995138283", parentPhone: null },
    { name: "Mannopov Olloyor", phone: "+998948044800", parentPhone: null },
    { name: "Karomatullayev Habibullo", phone: "+998936770178", parentPhone: null },
    { name: "Gulomjonova Shohsanam", phone: "+998995128983", parentPhone: null },
    { name: "Ochilboyeva Jasmina", phone: "+998945025558", parentPhone: null },
    { name: "Orifjonov Orifjon", phone: "+998200222462", parentPhone: null },
    { name: "Roziqulov Hojimurod", phone: "+998993075074", parentPhone: null },
    { name: "Xakimjonova Shoxrux", phone: "+998959575101", parentPhone: null },
    { name: "Abdumutalibov Abrorbek", phone: "+998509908510", parentPhone: null },
    { name: "Habibullayev Davlatbek", phone: "+998993241675", parentPhone: null },
    { name: "Islomjonov Bekmurod", phone: "+998932892690", parentPhone: null },
    { name: "Ganiyev Zakariyo", phone: "+998998513716", parentPhone: null },
    { name: "Farhodova Farangiz", phone: "+998996793487", parentPhone: null },
    { name: "Abdulazizov Botirjon", phone: "+998930674181", parentPhone: null },
    { name: "Ganijonov Muhammadrizo", phone: "+998934532286", parentPhone: null },
    { name: "Husniddinov Fuzliddin", phone: "+998993678088", parentPhone: null },
    { name: "Ahmadjonov Shodiyor", phone: "+998957077201", parentPhone: null },
  ]);

  await addStudents("Pre IELTS 16-18 (Ramazon)", "Ramazon", [
    { name: "Yandashboyev Farruxbek", phone: "+998934955383", parentPhone: null },
    { name: "Uzoqov Alisher", phone: "+998993721855", parentPhone: null },
    { name: "Mo'minov Barhayot", phone: "+998934907084", parentPhone: null },
    { name: "Normatjonova Behruza", phone: "+998931741660", parentPhone: null },
    { name: "Xolmamatov Rashidbek", phone: "+998995174005", parentPhone: null },
    { name: "Ahmadjonova Hulkar", phone: null, parentPhone: null },
    { name: "Ahmadjonova Mubina", phone: "+998996521275", parentPhone: null },
    { name: "Anvarova Madina", phone: "+998934479117", parentPhone: null },
  ]);

  await addStudents("Pre IELTS 16-19 (Shahlo)", "Shahlo", [
    { name: "Habibullayeva Marjona", phone: "+998881176252", parentPhone: null },
    { name: "Hamidjonova Elmira", phone: "+998933722484", parentPhone: null },
    { name: "Abdulxamidov Jamshidbek", phone: "+998942768510", parentPhone: null },
    { name: "Anvarjonova Intizor", phone: "+998995100687", parentPhone: null },
    { name: "Valijonov Elshodbek", phone: "+998505111684", parentPhone: null },
    { name: "Urayimjonov Husanboy", phone: "+998941793471", parentPhone: null },
    { name: "Haydaraliyeva Mumtozbegim", phone: "+998949053577", parentPhone: null },
    { name: "Rahimjonov Abubakr", phone: "+998949749004", parentPhone: null },
    { name: "Saxiboyev Shamshodbek", phone: "+998930943813", parentPhone: null },
    { name: "Murodjonov Ravshan", phone: "+998937886361", parentPhone: null },
    { name: "G'ayrataliyev Otabek", phone: "+998951325191", parentPhone: null },
    { name: "Solijonova Kamola", phone: "+998958090408", parentPhone: null },
    { name: "Murotaliyeva Malika", phone: "+998940970082", parentPhone: null },
    { name: "Esonaliyev Azizbek", phone: "+998996097702", parentPhone: null },
    { name: "Ilyosbekov Abbosbek", phone: "+998903056644", parentPhone: null },
    { name: "Vohidjonov Barhayot", phone: "+998955588250", parentPhone: null },
    { name: "Solijonova Shaxzoda", phone: "+998500881959", parentPhone: null },
    { name: "Rasuljonova Farzona", phone: "+998996409270", parentPhone: null },
    { name: "Xursanaliyeva Zebuzar", phone: "+998931660288", parentPhone: null },
    { name: "Matoirova Matluba", phone: "+998941516555", parentPhone: null },
    { name: "Sunnatilayeva Sug'diyona", phone: "+998999160688", parentPhone: null },
    { name: "Sheraliyev Sarvar", phone: "+998951227644", parentPhone: null },
    { name: "Ahmadjonova Sevinch", phone: "+998934114522", parentPhone: null },
    { name: "Nuriddinov Bekmurod", phone: "+998770205885", parentPhone: null },
    { name: "Risqaliyeva Sadoqat", phone: "+998993750119", parentPhone: null },
    { name: "Akramov Asilbek", phone: "+998956630035", parentPhone: null },
    { name: "Hakimaliyev Abrorxo'ja", phone: "+998917668801", parentPhone: null },
    { name: "Olimjonova Odina", phone: "+998991418781", parentPhone: null },
    { name: "Karimov Boburshox", phone: "+998935046424", parentPhone: null },
    { name: "Abduqodirov Asilbek", phone: null, parentPhone: null },
  ]);

  await addStudents("President (Shahlo)", "Shahlo", [
    { name: "Rahimjonova Mubinabonu", phone: "+998950872889", parentPhone: null },
    { name: "Baxtiyorova Farangiz", phone: "+998770095727", parentPhone: null },
    { name: "Vohobjonova Oygul", phone: "+998958389091", parentPhone: null },
    { name: "Omiljonova Gulasal", phone: "+998999161301", parentPhone: null },
    { name: "Rasuljonova Shabnam", phone: "+998950436689", parentPhone: null },
    { name: "Furqatjonov Ibrohimjon", phone: "+998949820020", parentPhone: null },
    { name: "Xudoyqulov Og'abek", phone: "+998990078284", parentPhone: null },
    { name: "Abdujabborova Shahnoza", phone: "+998931959545", parentPhone: null },
  ]);

  await addStudents("Pre IELTS 14-16 (Shahlo)", "Shahlo", [
    { name: "Nemadjonova Nazokat", phone: "+998930545093", parentPhone: null },
    { name: "Sattoraliyeva Gulasal", phone: "+998942734387", parentPhone: null },
    { name: "Ikromov Dostonbek", phone: "+998917553068", parentPhone: null },
    { name: "Shermuhammadova Dilnura", phone: "+998948860414", parentPhone: null },
    { name: "Abdulhayev Vohidjon", phone: "+998505874753", parentPhone: null },
    { name: "Naziraliyeva Muazzam", phone: "+998941723089", parentPhone: null },
    { name: "Rahimaliyeva Sabina", phone: "+998942784846", parentPhone: null },
    { name: "Ossonoqulova Shaydo", phone: "+998700609896", parentPhone: null },
    { name: "Nematxonov Mironshoh", phone: "+998939132172", parentPhone: null },
    { name: "To'lqinjonova Gulizar", phone: "+998999726407", parentPhone: null },
    { name: "Karimov Islomjon", phone: "+998943042585", parentPhone: null },
    { name: "Rahmonova Ziyoda", phone: "+998993958771", parentPhone: null },
    { name: "Rahmonberdiyeva", phone: "+998972554446", parentPhone: null },
    { name: "Ikromaliyeva Muslima", phone: "+998940319686", parentPhone: null },
    { name: "Olimjonova Diyora", phone: null, parentPhone: null },
  ]);

  await addStudents("Pre-Interm 14-16 (Afruzbek)", "Afruzbek", [
    { name: "Ismoilova Farangiz", phone: "+998930594115", parentPhone: null },
    { name: "Saminjonova Gulruxsor", phone: "+998998597585", parentPhone: null },
    { name: "Mamurova Marjona", phone: "+998941524046", parentPhone: null },
    { name: "Rahimova Xosiyatxon", phone: "+998930044911", parentPhone: null },
    { name: "Abdullaxonov Anvarxon", phone: "+998941548026", parentPhone: null },
    { name: "Qosimov Kamron", phone: "+998994908027", parentPhone: null },
    { name: "Muhammadjonov Javohir", phone: "+998943034112", parentPhone: null },
    { name: "Asatullayev Axror", phone: "+998973752332", parentPhone: null },
    { name: "Abdurahimov Abduqodir", phone: "+998502223474", parentPhone: null },
    { name: "Rasuljonov O'tkirbek", phone: "+998945079233", parentPhone: null },
    { name: "Abdukarimova Sokina", phone: "+998943022383", parentPhone: null },
    { name: "Sharofova Mastona", phone: "+998941890085", parentPhone: null },
    { name: "Roxataloyeva Shahlo", phone: "+998943108389", parentPhone: null },
    { name: "Ilhomjonova Gulyuz", phone: "+998772629887", parentPhone: null },
    { name: "Ilhomov Ziyobek", phone: "+79246368791", parentPhone: null },
    { name: "Soataliyeva Zohida", phone: "+998947848184", parentPhone: null },
    { name: "Sobirjanova Nazira", phone: "+998999005376", parentPhone: null },
    { name: "Nuriddinova Oygul", phone: "+998944504487", parentPhone: null },
    { name: "Abduljalilova Omina", phone: "+998993696878", parentPhone: null },
    { name: "Komiljonov Elshod", phone: "+998333672000", parentPhone: null },
    { name: "Mahmudjonov Eldorbek", phone: "+998933946088", parentPhone: null },
  ]);

  await addStudents("Intermediate 14-16 (Afruzbek)", "Afruzbek", [
    { name: "Ikromaliyev Behruz", phone: "+998879523858", parentPhone: null },
    { name: "Qo'shmurodov Dilmuhammad", phone: "+998950166786", parentPhone: null },
    { name: "To'xtasinov Salohiddin", phone: "+998941417704", parentPhone: null },
    { name: "Mamasodiqov Dovudbek", phone: "+998994951519", parentPhone: null },
    { name: "Iskandarov Diyor", phone: "+998970503322", parentPhone: null },
    { name: "Xoshimaliyev Umidjon", phone: "+998946100080", parentPhone: null },
    { name: "Xamidjonov Omadbek", phone: "+998941526773", parentPhone: null },
    { name: "Nabijonova Farangiz", phone: "+998941550184", parentPhone: null },
    { name: "Akbaraliyeva Dildora", phone: "+998958254181", parentPhone: null },
    { name: "Abduqodirova Mohichehra", phone: "+998994751957", parentPhone: null },
    { name: "Alisherova Mehrona", phone: "+998957977705", parentPhone: null },
    { name: "Gapurova Mohinur", phone: "+998333351115", parentPhone: null },
    { name: "Ilhomjonov Muhammad", phone: "+998991231611", parentPhone: null },
    { name: "Abdusaidov Jo'rabek", phone: "+998991234449", parentPhone: null },
    { name: "Muhammadiyev Asilbek", phone: "+998934036379", parentPhone: null },
    { name: "G'anijonova Shoxsanam", phone: "+998913559986", parentPhone: null },
    { name: "Ismoilova Xumora", phone: "+998993282641", parentPhone: null },
    { name: "Korotkov Temur", phone: "+998950596588", parentPhone: null },
    { name: "Urumboyev Elshodbek", phone: "+998884047484", parentPhone: null },
  ]);

  console.log('\n=== YAKUNIY STATISTIKA ===');
  const totalStudents = await prisma.student.count();
  const totalGroups = await prisma.group.count();
  const totalTeachers = await prisma.teacher.count();
  console.log(`O'quvchilar: ${totalStudents}`);
  console.log(`Guruhlar: ${totalGroups}`);
  console.log(`O'qituvchilar: ${totalTeachers}`);
  console.log('\n=== LOGIN MA\'LUMOTLARI ===');
  console.log('Owner:   hasanboy / hasanboy2024');
  console.log('Manager: elbek / manager2024');
  console.log('Manager: doniyor / manager2024');
  console.log('\n✅ Seed muvaffaqiyatli tugadi!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
