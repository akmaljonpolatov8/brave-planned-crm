import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { PageShell } from "../components/PageShell";

type Group = { id: number; name: string };
type SmsLog = { id: number; student_name?: string; phone: string; message: string; month?: string; status: string; sent_at: string };

export function SmsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [groupId, setGroupId] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/groups"),
      api.get("/sms/logs"),
    ]).then(([groupRes, logRes]) => {
      setGroups(groupRes.data);
      setLogs(logRes.data || []);
    });
  }, []);

  const defaultMsg = () => {
    const m = new Intl.DateTimeFormat("uz-UZ", { month: "long" }).format(new Date());
    return `Hurmatli ota-ona, farzandingizning ${m} oyi uchun to'lovi amalga oshirilmagan. Iltimos to'lovni amalga oshiring. Brave and Planet o'quv markazi.`;
  };

  const send = async () => {
    if (!message.trim()) return toast.error("Xabar matni bo'sh");
    setSending(true);
    try {
      const res = await api.post("/sms/send", { groupId: groupId || undefined, message });
      toast.success(`${res.data?.count || 0} ta SMS yuborildi`);
      const logRes = await api.get("/sms/logs");
      setLogs(logRes.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell title="SMS" description="SMS yuborish va tarixi.">
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Send Panel */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,214,98,0.15)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ color: '#FFD662', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 600 }}>SMS YUBORISH</h2>

          <select className="input mb-3" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            <option value="">Barcha guruhlar</option>
            {groups.map((g) => (<option key={g.id} value={g.id}>{g.name}</option>))}
          </select>

          <textarea
            className="input mb-2"
            style={{ minHeight: '120px', resize: 'vertical' }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Xabar matni..."
          />

          <div className="flex flex-wrap gap-2 mb-4">
            <button type="button" onClick={() => setMessage(defaultMsg())}
              style={{ background: 'rgba(255,214,98,0.1)', color: '#FFD662', border: '1px solid rgba(255,214,98,0.2)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer' }}>
              Qarzdorlar shabloni
            </button>
          </div>

          <button onClick={send} disabled={sending}
            style={{ width: '100%', padding: '14px', background: '#FFD662', color: '#2d1b4e', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: sending ? 0.5 : 1 }}>
            {sending ? "Yuborilmoqda..." : "📤 SMS Yuborish"}
          </button>
        </div>

        {/* History Panel */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,214,98,0.15)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ color: '#FFD662', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 600 }}>SMS TARIXI</h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>#</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Telefon</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Xabar</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Holat</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>SMS tarixi yo'q</td></tr>
                ) : (
                  logs.slice(0, 50).map((log, i) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px', color: 'rgba(255,255,255,0.5)' }}>{i + 1}</td>
                      <td style={{ padding: '12px', color: 'rgba(255,255,255,0.75)' }}>{log.phone}</td>
                      <td style={{ padding: '12px', color: 'rgba(255,255,255,0.6)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.message}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                          background: log.status === 'sent' ? 'rgba(22,163,74,0.15)' : log.status === 'failed' ? 'rgba(220,38,38,0.15)' : 'rgba(217,119,6,0.15)',
                          color: log.status === 'sent' ? '#4ade80' : log.status === 'failed' ? '#f87171' : '#fbbf24',
                        }}>
                          {log.status === 'sent' ? 'Yuborildi' : log.status === 'failed' ? 'Xato' : 'Kutilmoqda'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
