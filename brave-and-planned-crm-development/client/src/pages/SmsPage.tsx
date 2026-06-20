import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { PageShell } from "../components/PageShell";

type Group = { id: number; name: string };
type Student = { id: number; full_name: string; phone?: string; parent_phone?: string };
type SmsLog = { id: number; student_name?: string; phone: string; message: string; month?: string; status: string; sent_at: string };

export function SmsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState(
    "Hurmatli ota-ona, farzandingizning to'lovi amalga oshirilmagan. Iltimos to'lovni amalga oshiring. Brave and Planet o'quv markazi."
  );
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [sending, setSending] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Load groups + logs
  useEffect(() => {
    Promise.all([api.get("/groups"), api.get("/sms/logs")]).then(([gRes, lRes]) => {
      setGroups(gRes.data || []);
      setLogs(lRes.data || []);
    });
  }, []);

  // When group changes — load students
  const handleGroupChange = async (gId: string) => {
    setSelectedGroup(gId);
    setSelectedIds(new Set());
    setStudents([]);
    if (!gId) return;

    setLoadingStudents(true);
    try {
      const res = await api.get(`/groups/${gId}/students`);
      setStudents(res.data || []);
    } catch { setStudents([]); }
    finally { setLoadingStudents(false); }
  };

  const toggleStudent = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === students.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(students.map(s => s.id)));
  };

  const handleSend = async () => {
    if (selectedIds.size === 0) return toast.error("Kamida 1 ta o'quvchi tanlang");
    if (!message.trim()) return toast.error("Xabar matni bo'sh");

    setSending(true);
    try {
      // Get phones of selected students
      const phones = students
        .filter(s => selectedIds.has(s.id))
        .map(s => s.parent_phone || s.phone)
        .filter(Boolean) as string[];

      const res = await api.post("/sms/send", { phones, message, groupId: selectedGroup });
      toast.success(res.data?.message || `${res.data?.count || 0} ta SMS yuborildi`);
      if (res.data?.failed > 0) toast.error(`${res.data.failed} ta xato`);

      // Refresh logs
      const logRes = await api.get("/sms/logs");
      setLogs(logRes.data || []);
      setSelectedIds(new Set());
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik");
    } finally { setSending(false); }
  };

  const allSelected = students.length > 0 && selectedIds.size === students.length;

  return (
    <PageShell title="SMS" description="Guruh tanlang → o'quvchilarni belgilang → SMS yuboring">
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr', maxWidth: '100%' }} className="lg:grid-cols-[420px_1fr]">
        {/* SEND PANEL */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,214,98,0.15)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ color: '#FFD662', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 600 }}>
            SMS YUBORISH
          </div>

          {/* Group selector */}
          <select className="input" style={{ marginBottom: '12px' }} value={selectedGroup} onChange={(e) => handleGroupChange(e.target.value)}>
            <option value="">— Guruh tanlang —</option>
            {groups.map((g) => (<option key={g.id} value={g.id}>{g.name}</option>))}
          </select>

          {/* Student list with checkboxes */}
          {selectedGroup && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                  O'quvchilar ({students.length} ta)
                </span>
                {students.length > 0 && (
                  <button onClick={toggleAll} style={{ background: 'rgba(255,214,98,0.1)', border: '1px solid rgba(255,214,98,0.2)', borderRadius: '6px', padding: '3px 10px', color: '#FFD662', fontSize: '11px', cursor: 'pointer' }}>
                    {allSelected ? 'Olib tashlash' : 'Barchasini tanlash'}
                  </button>
                )}
              </div>

              {loadingStudents ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.4)' }}>Yuklanmoqda...</div>
              ) : students.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.3)' }}>O'quvchi topilmadi</div>
              ) : (
                <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                  {students.map((s, i) => {
                    const isSelected = selectedIds.has(s.id);
                    return (
                      <div key={s.id} onClick={() => toggleStudent(s.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer',
                        borderBottom: i < students.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        background: isSelected ? 'rgba(255,214,98,0.06)' : 'transparent',
                      }}>
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                          border: isSelected ? '2px solid #FFD662' : '2px solid rgba(255,255,255,0.2)',
                          background: isSelected ? '#FFD662' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {isSelected && <span style={{ color: '#1a0f2e', fontSize: '12px', fontWeight: 700 }}>✓</span>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: 'white', fontSize: '13px' }}>{s.full_name}</div>
                          {(s.parent_phone || s.phone) && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>{s.parent_phone || s.phone}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {selectedIds.size > 0 && (
                <div style={{ marginTop: '6px', color: '#FFD662', fontSize: '12px', textAlign: 'right' }}>
                  {selectedIds.size} ta tanlandi
                </div>
              )}
            </div>
          )}

          {/* Message textarea */}
          <textarea
            className="input"
            style={{ minHeight: '100px', resize: 'vertical', marginBottom: '4px' }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Xabar matni..."
            aria-describedby="sms-counter"
          />
          <div id="sms-counter" aria-live="polite" style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '12px' }}>
            <span>Belgilar soni: {message.length}</span>
            <span>SMS qismlari: {Math.ceil(message.length / 160) || 1}</span>
          </div>

          {/* Templates */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <button onClick={() => setMessage("Hurmatli ota-ona, farzandingizning to'lovi amalga oshirilmagan. Iltimos to'lovni amalga oshiring. Brave and Planet o'quv markazi.")}
              style={{ background: 'rgba(255,214,98,0.1)', border: '1px solid rgba(255,214,98,0.2)', borderRadius: '20px', padding: '3px 10px', color: '#FFD662', fontSize: '11px', cursor: 'pointer' }}>
              Qarzdorlar shabloni
            </button>
          </div>

          {/* Send button */}
          <button onClick={handleSend} disabled={sending || selectedIds.size === 0}
            style={{
              width: '100%', padding: '14px', background: (sending || selectedIds.size === 0) ? 'rgba(255,214,98,0.3)' : '#FFD662',
              border: 'none', borderRadius: '12px', color: '#2d1b4e', fontSize: '15px', fontWeight: 700,
              cursor: (sending || selectedIds.size === 0) ? 'not-allowed' : 'pointer',
            }}>
            {sending ? "Yuborilmoqda..." : selectedIds.size > 0 ? `📤 ${selectedIds.size} ta o'quvchiga SMS` : "📤 SMS Yuborish"}
          </button>
        </div>

        {/* HISTORY PANEL */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,214,98,0.15)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ color: '#FFD662', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 600 }}>
            SMS TARIXI
          </div>
          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.3)' }}>SMS tarixi yo'q</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase' }}>#</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase' }}>Telefon</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase' }}>Xabar</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase' }}>Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 30).map((log, i) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.4)' }}>{i + 1}</td>
                      <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.7)' }}>{log.phone}</td>
                      <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.5)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.message}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                          background: log.status === 'sent' ? 'rgba(34,197,94,0.15)' : log.status === 'failed' ? 'rgba(220,38,38,0.15)' : 'rgba(217,119,6,0.15)',
                          color: log.status === 'sent' ? '#4ade80' : log.status === 'failed' ? '#f87171' : '#fbbf24',
                        }}>
                          {log.status === 'sent' ? '✓ Yuborildi' : log.status === 'failed' ? '✗ Xato' : '⏳ Kutilmoqda'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
