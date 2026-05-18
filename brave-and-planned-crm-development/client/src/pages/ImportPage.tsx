import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { isOwner } from "../lib/permissions";

type ImportSummary = {
  teacherCount: number;
  groupCount: number;
  studentCount: number;
  membershipCount: number;
  sheetCount: number;
};

async function readFileAsBase64(file: File) {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

export function ImportPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  if (!isOwner(user)) {
    return (
      <div className="page-stack">
        <div className="stat-card">
          <h1>Excel import</h1>
          <p>Bu bo'lim faqat owner uchun ochiq.</p>
        </div>
      </div>
    );
  }

  const submit = async () => {
    if (!file) {
      toast.error("Avval Excel faylni tanlang");
      return;
    }
    if (!confirmReplace) {
      toast.error("Almashtirishni tasdiqlang");
      return;
    }

    setLoading(true);
    setSummary(null);
    try {
      const contentBase64 = await readFileAsBase64(file);
      const response = await api.post("/import/excel", {
        fileName: file.name,
        contentBase64,
      });
      setSummary(response.data.summary);
      toast.success("Excel import tugadi");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Excel importda xatolik";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <div className="toolbar">
        <div>
          <h1>Excel import</h1>
          <p>O'quvchi, o'qituvchi va guruhlarni Excel fayldan yuklash</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="form-grid">
          <div style={{ color: "var(--warning)", fontWeight: 700 }}>
            Diqqat: bu import joriy o'quvchi, o'qituvchi, guruh, attendance, payment va SMS log
            ma'lumotlarini almashtiradi.
          </div>
          <div style={{ color: "var(--text-soft)" }}>
            Oddiy holatda yangi o'quvchini keyin ham qo'lda qo'shishingiz mumkin. Muammo faqat shu
            importni qayta bossangiz eski akademik data yangisiga almashtiriladi.
          </div>
          <label className="form-label">
            Excel fayl
            <input
              className="bp-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>
          <label className="form-label" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={confirmReplace}
              onChange={(event) => setConfirmReplace(event.target.checked)}
            />
            Joriy akademik ma'lumotlar almashtirilishini tasdiqlayman
          </label>
          <div style={{ color: "var(--text-soft)" }}>
            Tanlangan fayl: {file?.name || "hali tanlanmagan"}
          </div>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Import qilinmoqda..." : "Excel import qilish"}
          </Button>
        </div>
      </div>

      {summary ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          <div className="stat-card">
            <div>Sheetlar</div>
            <strong style={{ fontSize: 32 }}>{summary.sheetCount}</strong>
          </div>
          <div className="stat-card">
            <div>O'qituvchilar</div>
            <strong style={{ fontSize: 32 }}>{summary.teacherCount}</strong>
          </div>
          <div className="stat-card">
            <div>Guruhlar</div>
            <strong style={{ fontSize: 32 }}>{summary.groupCount}</strong>
          </div>
          <div className="stat-card">
            <div>O'quvchilar</div>
            <strong style={{ fontSize: 32 }}>{summary.studentCount}</strong>
          </div>
          <div className="stat-card">
            <div>Birikmalar</div>
            <strong style={{ fontSize: 32 }}>{summary.membershipCount}</strong>
          </div>
        </div>
      ) : null}
    </div>
  );
}
