import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MessageSquare, CheckCircle2, Loader2 } from "lucide-react";
import api from "../api/axios";
import { PageShell } from "../components/PageShell";

export function DebtorsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingIds, setSendingIds] = useState<Set<number>>(new Set());

  const load = () => {
    setLoading(true);
    api.get("/debtors")
      .then((res) => setRows(res.data || []))
      .catch((err) => {
        console.error("Debtors load error:", err);
        toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const sendAllSms = async () => {
    if (!confirm("Barcha qarzdorlarga SMS eslatma yuborishni tasdiqlaysizmi?")) return;
    setSendingAll(true);
    try {
      await api.post("/debtors/send-all");
      toast.success("Barchaga SMS yuborildi");
      load();
    } catch (err) {
      console.error(err);
      toast.error("SMS yuborishda xatolik yuz berdi");
    } finally {
      setSendingAll(false);
    }
  };

  const sendSingleSms = async (paymentId: number, name: string) => {
    setSendingIds((prev) => {
      const next = new Set(prev);
      next.add(paymentId);
      return next;
    });
    try {
      await api.post(`/debtors/${paymentId}/send`);
      toast.success(`${name} uchun SMS muvaffaqiyatli yuborildi`);
    } catch (err) {
      console.error(err);
      toast.error("SMS yuborishda xatolik yuz berdi");
    } finally {
      setSendingIds((prev) => {
        const next = new Set(prev);
        next.delete(paymentId);
        return next;
      });
    }
  };

  return (
    <PageShell
      title="Qarzdorlar"
      description="Joriy oy to'lov qilmaganlar va SMS yuborish."
      action={
        <button
          className="btn-primary flex items-center gap-2"
          disabled={loading || sendingAll || rows.length === 0}
          onClick={sendAllSms}
          aria-label="Barcha qarzdorlarga SMS eslatma yuborish"
        >
          {sendingAll ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Yuborilmoqda...</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4" />
              <span>Barchaga SMS</span>
            </>
          )}
        </button>
      }
    >
      {!loading && rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/5 border border-white/10 rounded-2xl">
          <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mb-4 text-green-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Qarzdorlar mavjud emas</h3>
          <p className="text-sm text-white/50 max-w-sm">
            Hamma o'quvchilar joriy oy to'lovlarini o'z vaqtida amalga oshirishgan! 🎉
          </p>
        </div>
      ) : (
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>O'quvchi</th>
                <th>Guruh</th>
                <th>Miqdor</th>
                <th>Kechikish</th>
                <th>Telefon</th>
                <th>Amal</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white/50">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#FFD662]" />
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const isSendingThis = sendingIds.has(row.payment_id);
                  return (
                    <tr key={row.payment_id}>
                      <td className="font-medium">{row.full_name}</td>
                      <td>{row.group_name}</td>
                      <td>{row.amount} so'm</td>
                      <td>{row.days_overdue} kun</td>
                      <td>{row.parent_phone || "-"}</td>
                      <td>
                        <button
                          className="btn-secondary text-xs flex items-center gap-1.5 min-w-[130px] justify-center"
                          disabled={isSendingThis}
                          onClick={() => sendSingleSms(row.payment_id, row.full_name)}
                          aria-label={`${row.full_name} uchun SMS eslatma yuborish`}
                        >
                          {isSendingThis ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Yuborilmoqda...</span>
                            </>
                          ) : (
                            <>
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>SMS yuborish</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
