import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function parseDays(days: string): string[] {
  if (!days || days === "—" || days === "") return [];
  return days.split(",").map((d) => d.trim()).filter(Boolean);
}

function parseTime(time: string): { startTime: string; endTime: string } {
  if (!time || time === "—") return { startTime: "00:00", endTime: "00:00" };
  if (time.includes("-")) {
    const [start, end] = time.split("-");
    return { startTime: start.trim(), endTime: end.trim() };
  }
  return { startTime: time.trim(), endTime: "" };
}

async function main() {
  console.log("Seeding...");

  const ownerPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password: ownerPassword, role: "OWNER" },
  });
  console.log("Owner yaratildi: admin / admin123");

  const defaultPassword = await bcrypt.hash("teacher123", 10);
  const teacherMap: Record<string, string> = {};

  const teachersData = [
    { username: "azizbek", fullName: "Azizbek" },
    { username: "oydina", fullName: "Oydina" },
    { username: "parvina", fullName: "Parvina" },
    { username: "iqboljon", fullName: "Iqboljon" },
    { username: "bexruz", fullName: "Bexruz" },
    { username: "shaxina", fullName: "Shaxina" },
    { username: "hasanboy", fullName: "Hasanboy" },
    { username: "doniyorbek", fullName: "Doniyorbek" },
    { username: "farangiz", fullName: "Farangiz" },
    { username: "ramazon", fullName: "Ramazon" },
    { username: "shahlo", fullName: "Shahlo" },
    { username: "afruzbek", fullName: "Afruzbek" },
  ];

  for (const t of teachersData) {
    const user = await prisma.user.upsert({
      where: { username: t.username },
      update: {},
      create: { username: t.username, password: defaultPassword, role: "TEACHER" },
    });
    const teacher = await prisma.teacher.upsert({
      where: { userId: user.id },
      update: {},
      create: { fullName: t.fullName, userId: user.id },
    });
    teacherMap[t.fullName] = teacher.id;
  }
  console.log("O'\''qituvchilar yaratildi");

  const groupsData = [
    { name: "Pre IELTS 16:00 (Azizbek)", subject: "Pre IELTS", time: "16:00", days: "Du,Chor,Juma", teacher: "Azizbek", students: [{ name: "Saitkamalova Muhlisa", phone: "+998999313245" },{ name: "Qurvonaliyev Masrurbek", phone: "+79197470333" },{ name: "Ziroatxon Raxmonova", phone: "+998971042565" },{ name: "Shafoatxon Jo'\''raxonova", phone: "+998975717580" },{ name: "Alinazarov Shoxjahon", phone: "+998993211555" },{ name: "Munira Samijonova", phone: "+998993165580" },{ name: "Isroilov Mustafo", phone: "+79871545357" },{ name: "Odiljonov Asadbek", phone: "+998945017160" },{ name: "Ma'\''sudova Madina", phone: "+998931064788" },{ name: "Jamoldinova Sevinch", phone: "+998940808955" },{ name: "Kasymbayeva Saginabonu", phone: "+79060948444" },{ name: "Rozikova Diana", phone: "+998992218500" },{ name: "Mahmudaliyeva Mushtariy", phone: "+998934995865" }] },
    { name: "Pre IELTS 14:00 (Azizbek)", subject: "Pre IELTS", time: "14:00", days: "Du,Chor,Juma", teacher: "Azizbek", students: [{ name: "Rahimjonova Gulsevar", phone: "+998771824582" },{ name: "Jumanazarov Omadbek", phone: "+998943044777" },{ name: "Yuldashev Barkamol", phone: "+998995355060" },{ name: "Qurbonova Zilola", phone: "+998777810210" },{ name: "Xabibullayeva Saida", phone: "+998944892886" },{ name: "Olimjonova Mahsudaxon", phone: "+998975938885" },{ name: "Valijonova Asila", phone: "+998937781582" },{ name: "Abdualiyeva Laylo", phone: "+998774215383" },{ name: "Tulkinov Doston", phone: "+998701100086" },{ name: "Rahimjonov Muhammad", phone: "+998944470017" },{ name: "Xoshimaliyeva Mashhura", phone: "+998505224489" },{ name: "Mirsaidboyeva Shahrizoda", phone: "+998958308691" },{ name: "Orifjonova Kumush", phone: "+998935242286" },{ name: "Inomjonova Mohidil", phone: "+998933721155" },{ name: "Xaliljonov Ozodbek", phone: "+998999750636" },{ name: "Sobirjonova Uljanoy", phone: "+998503018479" },{ name: "Usmonova Dilnoza", phone: "+998945347626" },{ name: "Xonazarov Javohir", phone: "+998936789115" }] },
    { name: "Beginner 9:00 (Azizbek)", subject: "Beginner", time: "9:00", days: "Se,Pay,Shan", teacher: "Azizbek", students: [{ name: "Azamjonov Ogabek", phone: "+998945013659" },{ name: "Latipov Diyorbek", phone: "+79626924563" },{ name: "Yoqubjonov Shodiyorbek", phone: "+77772938408" },{ name: "Sidiqboyeva Durdona", phone: "+77781821689" },{ name: "Nosiraliyev Omadbek", phone: "+998932698808" },{ name: "Suvonova Masuma", phone: "+998500209015" },{ name: "Xayitova Ziyoda", phone: "+998930936676" },{ name: "Norboyeva Oyshamalak", phone: "+77770306787" },{ name: "Ergashboyev Saidjamol", phone: "+79626285646" },{ name: "Usmonaliyeva Malika", phone: "+998972556526" },{ name: "Abduqodirova Jamilabonu", phone: "+998997942329" },{ name: "Inomov Ramzan", phone: "+998338710777" },{ name: "Abdullayev Dilyorbek", phone: "+79163220028" },{ name: "Islomjonova Shabbona", phone: "+998972315888" },{ name: "Muhammadyusuf Toshmatov", phone: "+998935781212" },{ name: "Mahmudova Mehribon", phone: "+998779716704" },{ name: "Asadbek Alijonov", phone: "+998930367687" },{ name: "Buyukmirzo Orifjonov", phone: "+998913547000" }] },
    { name: "Beginner 14:00 (Oydina)", subject: "Beginner", time: "14:00", days: "", teacher: "Oydina", students: [{ name: "Axmadjonova Mushtariy", phone: "+998942003506" },{ name: "Asadillayeva Xushroy", phone: "+998932168687" },{ name: "Axmadaliyeva Xonzoda", phone: "+998777337408" },{ name: "Xoldaraliyeva Jasmina", phone: "+998943037783" },{ name: "Inomjonov Ravshanbek", phone: "+998972567956" },{ name: "Ilhomjonova Sojida", phone: "+998956414515" },{ name: "Islomova Zarina", phone: "+998950010168" },{ name: "Nabijonov Xushnudbek", phone: "+998508558381" },{ name: "Erkinboyeva Shohista", phone: "+998978258587" },{ name: "Madaminjonova Mumtoz begim", phone: "+998945092959" },{ name: "Xaydaraliyeva Mahorat", phone: "+998507245282" },{ name: "Jorayev Azizbek", phone: "+998770991152" },{ name: "Nishonaliyeva Guljahon", phone: "+998942762487" },{ name: "Xamdamjonova Shodiyona", phone: "+998941506094" },{ name: "Satinboyev Javohir", phone: "+998973764046" },{ name: "Nabijonova Sevinch", phone: "+998773350981" },{ name: "Ergashaliyev Azizbek", phone: "+998913442009" },{ name: "Valijonov Elbek", phone: "+998200088018" },{ name: "Negmatillayeva Farzona", phone: "+998505026484" },{ name: "Rahimjonova Ezoza", phone: "+998930696828" },{ name: "Zokiraliyev Muhammad", phone: "+998945715581" },{ name: "Azizxonova Mubina", phone: "+998939262233" },{ name: "Holdaraliyeva Madina", phone: "+998994308725" },{ name: "Imomaliyeva Gulziyo", phone: "+998941514007" }] },
    { name: "Beginner 16-18 (Parvina)", subject: "Beginner", time: "16:00-18:00", days: "", teacher: "Parvina", students: [{ name: "Bernara", phone: "+998994068206" },{ name: "Jannat", phone: "+998332830007" },{ name: "Shahrizoda", phone: "+998508786535" },{ name: "Gulsevar", phone: "+998990014486" },{ name: "Shohjaxon", phone: "+998501111811" },{ name: "Abdulbosit", phone: "+998951493809" },{ name: "Xusanboy", phone: "+998509982616" },{ name: "Mushtariy", phone: "+998996054705" },{ name: "Shirin", phone: "+998953171591" }] },
    { name: "Kids 14:00 (Parvina)", subject: "Kids", time: "14:00", days: "", teacher: "Parvina", students: [{ name: "Mamurova Mubinaxon", phone: "+998932643537" },{ name: "Shokirjonov Abdulloh", phone: "+998996999212" },{ name: "Ergashaliyev Jahongir", phone: "+998943006703" },{ name: "Odiljonova Malikabonu", phone: "+998999763187" },{ name: "Javlonov Javohir", phone: "+79310081883" },{ name: "Juraboyeva Diyora", phone: "+998958535558" },{ name: "Xolmatjonov Diyorbek", phone: "+998952867747" },{ name: "Zokiraliyev Xafizulloh", phone: "+998509096882" },{ name: "Abdulqosimov Durbek", phone: "+998942145552" },{ name: "Saydazimova Ominaxon", phone: "+998936700312" },{ name: "Azamboy", phone: "+998949225521" },{ name: "Boxodirov Dostonbek", phone: "+998939116979" }] },
    { name: "Intermediate 14-16 (Iqboljon)", subject: "Intermediate", time: "14:00-16:00", days: "", teacher: "Iqboljon", students: [{ name: "Sobitxojayev Abdulaziz", phone: "+998704745074" },{ name: "Abduqahhorova Hadichabonu", phone: "+998997227034" },{ name: "Ikromaliyeva Durdona", phone: "+998941632343" },{ name: "Mamurova Hadyabonu", phone: "+998972050400" },{ name: "Ahmadjonova Fotima", phone: "" },{ name: "Ahmadjonova Zuxra", phone: "+998948561974" },{ name: "Abdumuminova Gulhayo", phone: "+998941762687" },{ name: "Nuritdinova Sevinchxon", phone: "+998772240890" },{ name: "Tulaganov Rumid", phone: "+998509007586" },{ name: "Qahramonov Omadbek", phone: "+998942091714" },{ name: "Nishonboyev Saidjon", phone: "+998938727806" },{ name: "Hamidxonov Yusufxon", phone: "+998945935655" },{ name: "Sobirov Inomjon", phone: "+998991412609" },{ name: "Erkinov Jonibek", phone: "+998940073444" },{ name: "Tursinaliyeva Shahlo", phone: "+998995162919" }] },
    { name: "IELTS 1 (Bexruz)", subject: "IELTS", time: "00:00", days: "", teacher: "Bexruz", students: [{ name: "Rahimjonova Marvarid", phone: "+998952720662" },{ name: "Dilsuz", phone: "+998949900086" },{ name: "Oysuluv", phone: "+998700606722" },{ name: "Begoim", phone: "+998952715050" },{ name: "Muhhayo", phone: "+998950928883" },{ name: "Jamoliddin", phone: "+998994778883" },{ name: "Farangiz", phone: "+998504401715" },{ name: "Shahriyor Abdukarimov", phone: "+998777845779" },{ name: "Xushvaktjon", phone: "+998936788797" },{ name: "Rasuljonova Sarvara", phone: "+998777310687" },{ name: "Hamida", phone: "+998772744287" },{ name: "Nozila", phone: "+998700604330" },{ name: "Gulnoza", phone: "+998958543909" },{ name: "Ganijon", phone: "+998701067282" },{ name: "Feruza", phone: "+998970854582" },{ name: "Abduxoliqov Faxriyor", phone: "+998937400314" },{ name: "Salohiddin", phone: "+998501777083" },{ name: "Allommurod", phone: "+998506772901" },{ name: "Madina", phone: "+998977908588" },{ name: "Asrorjon", phone: "+998950725585" },{ name: "Fayzullo", phone: "+998502073211" },{ name: "Nozima", phone: "+998939388188" },{ name: "Xayrullo", phone: "+998950491881" },{ name: "Ozodbek", phone: "+998955893089" },{ name: "Muyassar", phone: "+998776331005" },{ name: "Dilrabo", phone: "+998943047938" },{ name: "Tulkinjon", phone: "+998934078377" },{ name: "Xusniiddin", phone: "+998949072610" },{ name: "Nazirjon", phone: "+998944496333" }] },
    { name: "Elementary 16-18 (Doniyorbek)", subject: "Elementary", time: "16:00-18:00", days: "Du,Chor,Juma", teacher: "Doniyorbek", students: [{ name: "Azatbayrova Mumtazabegim", phone: "+998501880480" },{ name: "Nazaraliyev Muhammadzohid", phone: "+998933151485" },{ name: "Rasuljonova Durdona", phone: "+998882580488" },{ name: "Ikromaliyeva Asema", phone: "+998936716801" },{ name: "Soataliyev Bekmurod", phone: "+998883791779" },{ name: "Butayev Suhrobjon", phone: "+998932435808" },{ name: "Xakimxonov Olimjon", phone: "+998941498587" },{ name: "Yaqubjonov Muhammadziyo", phone: "+998990122644" },{ name: "Sultanova Shukurona", phone: "+998940184868" },{ name: "Raxmonov Burxonjon", phone: "+998939421172" },{ name: "Nurmatov Alibek", phone: "+998938648070" },{ name: "Fazliddin", phone: "+998702335580" }] },
    { name: "Elementary 14-16 (Doniyorbek)", subject: "Elementary", time: "14:00-16:00", days: "Du,Chor,Juma", teacher: "Doniyorbek", students: [{ name: "Yuldashev Izzatbek", phone: "+998913553775" },{ name: "Rahbarov Sardorbek", phone: "+998972571710" },{ name: "Yunashboyeva Mehribon", phone: "+998951393931" },{ name: "Davlataliyev Muhammadali", phone: "+998996916765" },{ name: "Ahmedov Hikmatillo", phone: "+998993928716" },{ name: "Axadjonova Muazzam", phone: "+998995318607" },{ name: "Elmurodova Nargiza", phone: "+998940284400" },{ name: "Abdurasulova Bibisora", phone: "+998930894424" },{ name: "Shokirjonov Shohjahon", phone: "+998943063956" },{ name: "Toychiboyeva Oydina", phone: "+998888168784" },{ name: "Abdullayeva Istiqlola", phone: "+998936037908" },{ name: "Rasuljonova Jasmina", phone: "+998959735157" },{ name: "Muhiddinov Behruzbek", phone: "+998911821434" },{ name: "Xakimova Gulnoza", phone: "+998959575101" },{ name: "Usmonov Alisher", phone: "+998995138283" },{ name: "Mannopov Olloyor", phone: "+998948044800" },{ name: "Karomatullayev Habibullo", phone: "+998936770178" },{ name: "Gulomjonova Shohsanam", phone: "+998995128983" },{ name: "Ochilboyeva Jasmina", phone: "+998945025558" },{ name: "Orifjonov Orifjon", phone: "+998200222462" },{ name: "Roziqulov Hojimurod", phone: "+998993075074" },{ name: "Abdumutalibov Abrorbek", phone: "+998509908510" },{ name: "Habibullayev Davlatbek", phone: "+998993241675" },{ name: "Islomjonov Bekmurod", phone: "+998932892690" },{ name: "Ganiyev Zakariyo", phone: "+998998513716" },{ name: "Farhodova Farangiz", phone: "+998996793487" },{ name: "Abdulazizov Botirjon", phone: "+998930674181" },{ name: "Ganijonov Muhammadrizo", phone: "+998934532286" },{ name: "Husniddinov Fuzliddin", phone: "+998993678088" },{ name: "Ahmadjonov Shodiyor", phone: "+998957077201" }] },
    { name: "Intermediate 14-16 (Farangiz)", subject: "Intermediate", time: "14:00-16:00", days: "Du,Se,Juma", teacher: "Farangiz", students: [{ name: "Davlataliyeva Marjona", phone: "+998940721150" },{ name: "Ganiyev Tangriyor", phone: "+998702332603" },{ name: "Abdulxayeva Mubina", phone: "+998993922288" },{ name: "Yakubaliyev Ilgorbek", phone: "+998958142886" },{ name: "Alimov Behruz", phone: "+998979232386" },{ name: "Mahmmudjonov Abrorjon", phone: "+998949976686" },{ name: "Rahimjonov Yusufbek", phone: "+998958003372" },{ name: "Sodirjonov Islomjon", phone: "+998999095499" },{ name: "Usmonqulov Umidjon", phone: "+998950541884" },{ name: "Gayratov Nurshodbek", phone: "+998701066494" },{ name: "Xolmatjonova Oydin", phone: "+998952867747" },{ name: "Polatjonov Asadbek", phone: "+998940888507" },{ name: "Otaxonov Mirzakarim", phone: "+998947759884" },{ name: "Tolaganov Elbek", phone: "+998774453373" },{ name: "Xolmatov Botirjon", phone: "+998945070004" },{ name: "Mamanazarova Jasmina", phone: "+998937934001" },{ name: "Sobitova Madinaxon", phone: "+998931023276" },{ name: "Yuldashaliyev Firdavs", phone: "+998934940687" },{ name: "Olimov Bekzod", phone: "+998959273434" },{ name: "Solijonov Oybek", phone: "+998995117709" },{ name: "Sobitov Ulugbek", phone: "+998772021402" },{ name: "Erkinboyev Mirjamol", phone: "+998995175227" },{ name: "Toshmatova Dilrabo", phone: "+998507791556" }] },
    { name: "Pre IELTS 16-18 (Ramazon)", subject: "Pre IELTS", time: "16:00-18:00", days: "", teacher: "Ramazon", students: [{ name: "Yandashboyev Farruxbek", phone: "+998934955383" },{ name: "Uzoqov Alisher", phone: "+998993721855" },{ name: "Mominov Barhayot", phone: "+998934907084" },{ name: "Normatjonova Behruza", phone: "+998931741660" },{ name: "Xolmamatov Rashidbek", phone: "+998995174005" },{ name: "Ahmadjonova Mubina", phone: "+998996521275" },{ name: "Anvarova Madina", phone: "+998934479117" }] },
    { name: "Pre IELTS 16-19 (Shahlo)", subject: "Pre IELTS", time: "16:00-19:00", days: "", teacher: "Shahlo", students: [{ name: "Habibullayeva Marjona", phone: "+998881176252" },{ name: "Hamidjonova Elmira", phone: "+998933722484" },{ name: "Abdulxamidov Jamshidbek", phone: "+998942768510" },{ name: "Anvarjonova Intizor", phone: "+998995100687" },{ name: "Valijonov Elshodbek", phone: "+998505111684" },{ name: "Urayimjonov Husanboy", phone: "+998941793471" },{ name: "Haydaraliyeva Mumtozbegim", phone: "+998949053577" },{ name: "Rahimjonov Abubakr", phone: "+998949749004" },{ name: "Saxiboyev Shamshodbek", phone: "+998930943813" },{ name: "Murodjonov Ravshan", phone: "+998937886361" },{ name: "Gayrataliyev Otabek", phone: "+998951325191" },{ name: "Solijonova Kamola", phone: "+998958090408" },{ name: "Murotaliyeva Malika", phone: "+998940970082" },{ name: "Esonaliyev Azizbek", phone: "+998996097702" },{ name: "Ilyosbekov Abbosbek", phone: "+998903056644" },{ name: "Vohidjonov Barhayot", phone: "+998955588250" },{ name: "Solijonova Shaxzoda", phone: "+998500881959" },{ name: "Rasuljonova Farzona", phone: "+998996409270" },{ name: "Xursanaliyeva Zebuzar", phone: "+998931660288" },{ name: "Matoirova Matluba", phone: "+998941516555" },{ name: "Sunnatilayeva Sugdiyona", phone: "+998999160688" },{ name: "Sheraliyev Sarvar", phone: "+998951227644" },{ name: "Ahmadjonova Sevinch", phone: "+998934114522" },{ name: "Nuriddinov Bekmurod", phone: "+998770205885" },{ name: "Risqaliyeva Sadoqat", phone: "+998993750119" },{ name: "Akramov Asilbek", phone: "+998956630035" },{ name: "Olimjonova Odina", phone: "+998991418781" },{ name: "Karimov Boburshox", phone: "+998935046424" }] },
    { name: "President (Shahlo)", subject: "President", time: "00:00", days: "", teacher: "Shahlo", students: [{ name: "Rahimjonova Mubinabonu", phone: "+998950872889" },{ name: "Baxtiyorova Farangiz", phone: "+998770095727" },{ name: "Vohobjonova Oygul", phone: "+998958389091" },{ name: "Omiljonova Gulasal", phone: "+998999161301" },{ name: "Rasuljonova Shabnam", phone: "+998950436689" },{ name: "Furqatjonov Ibrohimjon", phone: "+998949820020" },{ name: "Xudoyqulov Ogabek", phone: "+998990078284" },{ name: "Abdujabborova Shahnoza", phone: "+998931959545" }] },
    { name: "Pre IELTS 14-16 (Shahlo)", subject: "Pre IELTS", time: "14:00-16:00", days: "", teacher: "Shahlo", students: [{ name: "Nemadjonova Nazokat", phone: "+998930545093" },{ name: "Sattoraliyeva Gulasal", phone: "+998942734387" },{ name: "Ikromov Dostonbek", phone: "+998917553068" },{ name: "Shermuhammadova Dilnura", phone: "+998948860414" },{ name: "Abdulhayev Vohidjon", phone: "+998505874753" },{ name: "Naziraliyeva Muazzam", phone: "+998941723089" },{ name: "Rahimaliyeva Sabina", phone: "+998942784846" },{ name: "Ossonoqulova Shaydo", phone: "+998700609896" },{ name: "Nematxonov Mironshoh", phone: "+998939132172" },{ name: "Tolqinjonova Gulizar", phone: "+998999726407" },{ name: "Karimov Islomjon", phone: "+998943042585" },{ name: "Rahmonova Ziyoda", phone: "+998993958771" },{ name: "Rahmonberdiyeva", phone: "+998972554446" },{ name: "Ikromaliyeva Muslima", phone: "+998940319686" }] },
    { name: "Pre-Intermediate 14-16 (Afruzbek)", subject: "Pre-Intermediate", time: "14:00-16:00", days: "", teacher: "Afruzbek", students: [{ name: "Ismoilova Farangiz", phone: "+998930594115" },{ name: "Saminjonova Gulruxsor", phone: "+998998597585" },{ name: "Mamurova Marjona", phone: "+998941524046" },{ name: "Rahimova Xosiyatxon", phone: "+998930044911" },{ name: "Abdullaxonov Anvarxon", phone: "+998941548026" },{ name: "Qosimov Kamron", phone: "+998994908027" },{ name: "Muhammadjonov Javohir", phone: "+998943034112" },{ name: "Asatullayev Axror", phone: "+998973752332" },{ name: "Abdurahimov Abduqodir", phone: "+998502223474" },{ name: "Rasuljonov Otkirbek", phone: "+998945079233" },{ name: "Abdukarimova Sokina", phone: "+998943022383" },{ name: "Sharofova Mastona", phone: "+998941890085" },{ name: "Roxataloyeva Shahlo", phone: "+998943108389" },{ name: "Ilhomjonova Gulyuz", phone: "+998772629887" },{ name: "Ilhomov Ziyobek", phone: "+79246368791" },{ name: "Soataliyeva Zohida", phone: "+998947848184" },{ name: "Sobirjanova Nazira", phone: "+998999005376" },{ name: "Nuriddinova Oygul", phone: "+998944504487" },{ name: "Abduljalilova Omina", phone: "+998993696878" },{ name: "Komiljonov Elshod", phone: "+998333672000" },{ name: "Mahmudjonov Eldorbek", phone: "+998933946088" }] },
    { name: "Intermediate 14-16 (Afruzbek)", subject: "Intermediate", time: "14:00-16:00", days: "", teacher: "Afruzbek", students: [{ name: "Ikromaliyev Behruz", phone: "+998879523858" },{ name: "Qoshmurodov Dilmuhammad", phone: "+998950166786" },{ name: "Toxtasinov Salohiddin", phone: "+998941417704" },{ name: "Mamasodiqov Dovudbek", phone: "+998994951519" },{ name: "Iskandarov Diyor", phone: "+998970503322" },{ name: "Xoshimaliyev Umidjon", phone: "+998946100080" },{ name: "Xamidjonov Omadbek", phone: "+998941526773" },{ name: "Nabijonova Farangiz", phone: "+998941550184" },{ name: "Akbaraliyeva Dildora", phone: "+998958254181" },{ name: "Abduqodirova Mohichehra", phone: "+998994751957" },{ name: "Alisherova Mehrona", phone: "+998957977705" },{ name: "Gapurova Mohinur", phone: "+998333351115" },{ name: "Ilhomjonov Muhammad", phone: "+998991231611" },{ name: "Abdusaidov Jorabek", phone: "+998991234449" },{ name: "Muhammadiyev Asilbek", phone: "+998934036379" },{ name: "Ganijonova Shoxsanam", phone: "+998913559986" },{ name: "Ismoilova Xumora", phone: "+998993282641" },{ name: "Korotkov Temur", phone: "+998950596588" },{ name: "Urumboyev Elshodbek", phone: "+998884047484" }] },
  ] as const;

  for (const g of groupsData) {
    const { startTime, endTime } = parseTime(g.time);
    const scheduleDays = parseDays(g.days);
    const teacherId = teacherMap[g.teacher];
    if (!teacherId) { console.warn("Teacher topilmadi:", g.teacher); continue; }

    let group = await prisma.group.findFirst({ where: { name: g.name } });
    if (!group) {
      group = await prisma.group.create({
        data: { name: g.name, subject: g.subject, startTime, endTime, scheduleDays, teacherId },
      });
    }

    for (const s of g.students) {
      const { firstName, lastName } = splitName(s.name);
      const phone = s.phone || null;
      let student = phone ? await prisma.student.findFirst({ where: { phone } }) : null;
      if (!student) {
        student = await prisma.student.create({ data: { firstName, lastName, phone } });
      }
      await prisma.studentGroup.upsert({
        where: { studentId_groupId: { studentId: student.id, groupId: group.id } },
        update: {},
        create: { studentId: student.id, groupId: group.id },
      });
    }
    console.log("Guruh tayyor:", g.name);
  }

  console.log("Seed muvaffaqiyatli tugadi!");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
