"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CourseCard from "@/components/ui/CourseCard";
import api from "@/lib/api";
import { Search } from "lucide-react";

const CATS = ["All","Cybersecurity","Web Development","AI","Data Analysis","Cloud Computing"];
const LEVELS = ["All","beginner","intermediate","advanced"];

function CoursesContent() {
  const sp = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(sp.get("category") || "All");
  const [level, setLevel] = useState("All");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetch = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 12 };
      if (category !== "All") params.category = category;
      if (level !== "All") params.level = level;
      if (search) params.search = search;
      const { data } = await api.get("/courses", { params });
      setCourses(data.courses || []);
      setTotal(data.total || 0);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [category, level, page]);

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-white">
        <div className="bg-primary py-14">
          <div className="container">
            <h1 className="text-4xl font-heading font-black text-white mb-2">Browse Courses</h1>
            <p className="text-slate-400">{total || "110+"} courses across 5 disciplines</p>
          </div>
        </div>

        <div className="container py-8">
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <form onSubmit={e => { e.preventDefault(); setPage(1); fetch(); }} className="flex gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search courses..." className="input pl-11" />
              </div>
              <button type="submit" className="btn-blue px-5">Search</button>
            </form>
            <select value={level} onChange={e => { setLevel(e.target.value); setPage(1); }}
              className="input w-auto capitalize">
              {LEVELS.map(l => <option key={l} className="capitalize">{l}</option>)}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {CATS.map(c => (
              <button key={c} onClick={() => { setCategory(c); setPage(1); }}
                className={`px-5 py-2 rounded-full text-sm font-heading font-semibold transition-all border ${
                  category === c ? "bg-secondary text-white border-secondary" : "bg-white text-slate-600 border-slate-200 hover:border-secondary hover:text-secondary"
                }`}>
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_,i) => <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">🔍</p>
              <h3 className="font-heading font-bold text-primary text-xl mb-2">No courses found</h3>
              <p className="text-slate-500 text-sm">Try different filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((c: any) => <CourseCard key={c.id} course={c} />)}
              </div>
              {total > 12 && (
                <div className="flex justify-center gap-3 mt-10">
                  <button disabled={page===1} onClick={() => setPage(p=>p-1)}
                    className="px-5 py-2 rounded-xl border border-slate-200 text-sm font-heading disabled:opacity-40 hover:bg-slate-50">← Prev</button>
                  <span className="px-5 py-2 text-sm text-slate-500">Page {page}</span>
                  <button disabled={courses.length < 12} onClick={() => setPage(p=>p+1)}
                    className="px-5 py-2 rounded-xl border border-slate-200 text-sm font-heading disabled:opacity-40 hover:bg-slate-50">Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function CoursesPage() {
  return <Suspense><CoursesContent /></Suspense>;
}
