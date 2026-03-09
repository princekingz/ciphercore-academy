"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { BookOpen, Award, TrendingUp, Settings, LogOut, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user, logout, loadUser } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState("courses");
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: "", bio: "" });

  useEffect(() => {
    loadUser().then(() => {
      const u = useAuthStore.getState().user;
      if (!u) { router.push("/auth/login"); return; }
      setProfile({ name: u.name, bio: u.bio || "" });
    });
    Promise.all([api.get("/enrollments/my"), api.get("/certificates/my")])
      .then(([e, c]) => { setEnrollments(e.data.enrollments || []); setCertificates(c.data.certificates || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (!user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const TABS = [
    { id:"courses", label:"My Courses", icon: BookOpen },
    { id:"certificates", label:"Certificates", icon: Award },
    { id:"settings", label:"Settings", icon: Settings },
  ];

  return (
    <>
      <Navbar dark />
      <div className="pt-16 min-h-screen bg-slate-50">
        <div className="bg-primary py-10">
          <div className="container flex items-center gap-4">
            <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-white font-heading font-black text-xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-heading font-black text-white text-2xl">{user.name}</h1>
              <p className="text-slate-400 text-sm capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label:"Enrolled", value: enrollments.length, icon: BookOpen, color:"text-secondary" },
              { label:"Certificates", value: certificates.length, icon: Award, color:"text-accent" },
              { label:"In Progress", value: enrollments.filter((e:any) => parseInt(e.completed_lessons) < parseInt(e.total_lessons)).length, icon: TrendingUp, color:"text-orange-500" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 text-center">
                <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                <div className="text-2xl font-heading font-black text-primary">{value}</div>
                <div className="text-slate-500 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden h-fit">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-heading font-medium transition-all border-b border-slate-50 ${
                    tab===id ? "bg-secondary/5 text-secondary border-r-2 border-secondary" : "text-slate-600 hover:bg-slate-50"
                  }`}>
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
              <button onClick={() => { logout(); router.push("/"); }}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm font-heading font-medium text-red-500 hover:bg-red-50 transition-all">
                <LogOut className="w-4 h-4" />Sign Out
              </button>
            </div>

            <div className="lg:col-span-3">
              {tab === "courses" && (
                <div>
                  <h2 className="font-heading font-bold text-primary text-lg mb-4">My Courses</h2>
                  {loading ? <div className="text-center py-10 text-slate-400">Loading...</div> :
                    enrollments.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                        <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <h3 className="font-heading font-bold text-primary mb-2">No courses yet</h3>
                        <p className="text-slate-500 text-sm mb-5">Enroll in a course to get started</p>
                        <Link href="/courses" className="btn-blue text-sm">Browse Courses</Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {enrollments.map((e: any) => {
                          const total = parseInt(e.total_lessons) || 0;
                          const done = parseInt(e.completed_lessons) || 0;
                          const pct = total > 0 ? Math.round((done/total)*100) : 0;
                          return (
                            <div key={e.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex gap-4 items-center">
                              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-xl shrink-0">
                                {e.category === "Cybersecurity" ? "🔐" : e.category === "Web Development" ? "💻" : e.category === "AI" ? "🤖" : "📊"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-heading font-semibold text-primary text-sm mb-1 truncate">{e.title}</h3>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-secondary rounded-full" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-xs text-slate-500 font-medium">{pct}%</span>
                                </div>
                              </div>
                              <Link href={`/courses/${e.slug}`}
                                className="text-secondary text-sm font-heading font-semibold flex items-center gap-1 hover:gap-2 transition-all shrink-0">
                                Continue <ChevronRight className="w-4 h-4" />
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )
                  }
                </div>
              )}

              {tab === "certificates" && (
                <div>
                  <h2 className="font-heading font-bold text-primary text-lg mb-4">My Certificates</h2>
                  {certificates.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                      <Award className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">Complete a course to earn your first certificate</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {certificates.map((c: any) => (
                        <div key={c.id} className="bg-primary rounded-2xl p-6">
                          <Award className="w-8 h-8 text-accent mb-3" />
                          <h3 className="font-heading font-bold text-white mb-1">{c.course_title}</h3>
                          <p className="text-slate-400 text-xs mb-3">ID: {c.certificate_id}</p>
                          <p className="text-slate-500 text-xs">Issued {new Date(c.issued_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "settings" && (
                <div className="bg-white rounded-2xl border border-slate-100 p-7">
                  <h2 className="font-heading font-bold text-primary text-lg mb-6">Account Settings</h2>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="label">Full Name</label>
                      <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="input" />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input type="email" value={user.email} disabled className="input opacity-60 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="label">Bio</label>
                      <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})}
                        className="input resize-none" rows={3} placeholder="Tell us about yourself..." />
                    </div>
                    <button className="btn-blue text-sm"
                      onClick={async () => {
                        try {
                          await api.put("/auth/profile", profile);
                          toast.success("Profile updated!");
                        } catch { toast.error("Update failed"); }
                      }}>
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
