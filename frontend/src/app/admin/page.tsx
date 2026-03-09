
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Users, BookOpen, DollarSign, TrendingUp, Shield } from "lucide-react";
import toast from "react-hot-toast";
export default function AdminPage() {
  const { user, loadUser } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [tab, setTab] = useState("users");

  useEffect(() => {
    loadUser().then(() => {
      const u = useAuthStore.getState().user;
      if (!u) { router.push("/auth/login"); return; }
      if (u.role !== "admin") { router.push("/dashboard"); return; }
    });
    Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/users"),
      api.get("/admin/payments"),
    ]).then(([s, u, p]) => {
      setStats(s.data.stats);
      setUsers(u.data.users || []);
      setPayments(p.data.payments || []);
    }).catch(() => {});
  }, []);

  if (!user) return null;

  const cards = stats ? [
    { label: "Total Users", value: stats.total_users, icon: Users, bg: "bg-blue-500" },
    { label: "Courses", value: stats.published_courses, icon: BookOpen, bg: "bg-green-500" },
    { label: "Revenue", value: `KSh ${parseInt(stats.total_revenue || 0).toLocaleString()}`, icon: DollarSign, bg: "bg-yellow-500" },
    { label: "Enrollments", value: stats.total_enrollments, icon: TrendingUp, bg: "bg-purple-500" },
  ] : [];

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-black text-primary">Admin Panel</h1>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map(({ label, value, icon: Icon, bg }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-heading font-black text-primary">{value}</p>
                <p className="text-slate-500 text-sm">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200 mb-6 w-fit">
            {["users", "payments"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2.5 rounded-lg text-sm font-heading font-semibold capitalize transition-all ${tab === t ? "bg-primary text-white" : "text-slate-600"}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {(tab === "users"
                      ? ["Name", "Email", "Role", "Joined"]
                      : ["Student", "Course", "Amount", "Method", "Status", "Date"]
                    ).map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-heading font-semibold text-slate-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tab === "users" && users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-primary text-sm">{u.name}</td>
                      <td className="px-5 py-4 text-slate-500 text-sm">{u.email}</td>
                      <td className="px-5 py-4">
                        <select
                          value={u.role}
                          onChange={async (e) => {
                            try {
                              await api.patch(`/admin/users/${u.id}/role`, { role: e.target.value });
                              setUsers(users.map((usr: any) => usr.id === u.id ? { ...usr, role: e.target.value } : usr));
                              toast.success("Role updated!");
                            } catch { toast.error("Failed to update role"); }
                          }}
                          className="text-xs font-heading font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white cursor-pointer outline-none"
                        >
                          <option value="student">student</option>
                          <option value="instructor">instructor</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {tab === "payments" && payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-primary text-sm">{p.user_name}</td>
                      <td className="px-5 py-4 text-slate-500 text-sm max-w-xs truncate">{p.course_title}</td>
                      <td className="px-5 py-4 font-heading font-semibold text-sm">KSh {parseInt(p.amount).toLocaleString()}</td>
                      <td className="px-5 py-4"><span className="tag bg-slate-100 text-slate-700 uppercase">{p.method}</span></td>
                      <td className="px-5 py-4">
                        <span className={`tag ${p.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
