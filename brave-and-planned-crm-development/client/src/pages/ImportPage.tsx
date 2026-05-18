import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { PageShell } from "../components/PageShell";

export function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const makeForm = () => {
    const form = new FormData();
    if (file) form.append("file", file);
    return form;
  };

  return (
    <PageShell title="Excel import" description="Talabalar_CRM_1.xlsx faylini preview va import qilish.">
      <div className="panel p-6">
        <input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="btn-secondary" disabled={!file || loading} onClick={async () => { setLoading(true); try { const res = await api.post("/import/excel/preview", makeForm(), { headers: { "Content-Type": "multipart/form-data" } }); setPreview(res.data); } finally { setLoading(false); } }}>Preview</button>
          <button className="btn-primary" disabled={!file || loading} onClick={async () => { setLoading(true); try { const res = await api.post("/import/excel", makeForm(), { headers: { "Content-Type": "multipart/form-data" } }); toast.success(`Import tugadi: ${res.data.students_imported} student`); } finally { setLoading(false); } }}>Import</button>
        </div>
      </div>
      {preview ? (
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Guruh</th>
                <th>O'qituvchi</th>
                <th>Student count</th>
              </tr>
            </thead>
            <tbody>
              {preview.groups.map((group: any, index: number) => (
                <tr key={`${group.name}-${index}`}>
                  <td>{group.name}</td>
                  <td>{group.teacher || "-"}</td>
                  <td>{group.student_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </PageShell>
  );
}
