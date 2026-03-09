"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { BookOpen, Users, DollarSign, Star, Plus } from "lucide-react";

export default function InstructorPage() {
  const { user, loadUser } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [tab, setTab] = useState("courses");

  useEffect(() => {
    loadUser().then(() => {
      const u = useAuthStore.getState().user;
      if (!u) { router.push("/auth/login"); return; }
      if (u.role !== "instructor" && u.role !== "admin") { router.push("/dashboard"); return; }
    });
    Promise.all([
      api.get("/instructor/stats"),
      api.get("/instructor/courses"),
      api.get("/instructor/students"),
    ]).then(([s, c, st]) => {
      setStats(s.data.stats);
      setCourses(c.data.courses || []);
      setStudents(st.data.students || []);
    }).catch(() => {});
  }, []);

  if (!user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const cards = stats ? [
    { label: "Courses", value: stats.total_courses, icon: BookOpen, bg: "bg-blue-500" },
    { label: "Students", value: stats.total_students, icon: Users, bg: "bg-green-500" },
    { label: "Earnings", value: `KSh ${parseInt(stats.total_earnings || 0).toLocaleString()}`, icon: DollarSign, bg: "bg-yellow-500" },
    { label: "Avg Rating", value: parseFloat(stats.avg_rating || 0).toFixed(1), icon: Star, bg: "bg-purple-500" },
  ] : [];

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-heading font-black text-primary">Instructor Dashboard</h1>
              <p className="text-slate-500 mt-1">Manage your courses and track student progress</p>
            </div>
            <Link href="/instructor/create-course" className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> New Course
            </Link>
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
            {["courses", "students"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2.5 rounded-lg text-sm font-heading font-semibold capitalize transition-all ${tab === t ? "bg-primary text-white" : "text-slate-600 hover:text-primary"}`}>
                {t}
              </button>
            ))}
          </div>

          {tab === "courses" && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {courses.length === 0 ? (
                <div className="p-14 text-center">
                  <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No courses yet.{" "}
                    <Link href="/instructor/create-course" className="text-secondary font-semibold">Create your first course</Link>
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {courses.map((c: any) => (
                    <div key={c.id} className="p-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-heading font-semibold text-primary text-sm">{c.title}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{c.student_count} students · {parseFloat(c.avg_rating || 0).toFixed(1)}★</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-heading font-bold text-primary text-sm">KSh {parseInt(c.price || 0).toLocaleString()}</span>
                        <span className={`tag ${c.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{c.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "students" && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {students.length === 0 ? (
                <div className="p-14 text-center">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No students enrolled yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {students.map((s: any) => (
                    <div key={s.id} className="p-5 flex items-center gap-4">
                      <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center text-white text-sm font-heading font-bold shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-heading font-medium text-primary text-sm">{s.name}</p>
                        <p className="text-slate-500 text-xs">{s.email}</p>
                      </div>
                      <p className="text-slate-500 text-xs hidden md:block">{s.course_title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
