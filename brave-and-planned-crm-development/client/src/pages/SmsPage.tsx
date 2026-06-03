import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { PageShell } from "../components/PageShell";
import type { Group } from "../types";

const defaultTemplate = () => {
  const month = new Intl.DateTimeFormat("uz-UZ", { month: "long" }).format(
    new Date(),
  );
  return `Hurmatli ota-ona, farzandingizning ${month} oyi uchun to'lovi amalga oshirilmagan. Iltimos to'lovni amalga oshiring. Brave and Planet o'quv markazi.`;
};

export function SmsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState("");
  const [message, setMessage] = useState(defaultTemplate());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/groups").then((response) => setGroups(response.data));
  }, []);

  const send = async () => {
    setLoading(true);
    try {
      await api.post("/sms/send", {
        groupId: groupId || undefined,
        message,
      });
      toast.success("SMS yuborildi");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "SMS yuborishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="SMS yuborish"
      description="Guruhga yoki barcha o'quvchilarga bir xil xabar yuborish paneli."
      action={
        <button className="btn-primary" disabled={loading} onClick={send}>
          {loading ? "Yuborilmoqda..." : "SMS Yuborish"}
        </button>
      }
    >
      <div className="panel space-y-4 p-6">
        <select
          className="input"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        >
          <option value="">Barcha guruhlar</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>

        <div className="relative">
          <textarea
            id="sms-message"
            className="input min-h-52"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Xabar matni"
            aria-describedby="char-counter"
          />
          <div
            id="char-counter"
            className="absolute bottom-3 right-4 text-xs text-white/40"
            aria-live="polite"
          >
            {message.length} ta belgi
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-white/55">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Ota telefon &gt; Ona telefon &gt; Telefon
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Loglar sms_logs jadvaliga yoziladi
          </span>
        </div>
      </div>
    </PageShell>
  );
}
