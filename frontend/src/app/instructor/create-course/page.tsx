"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";

const CATS = ["Cybersecurity", "Web Development", "AI", "Data Analysis", "Cloud Computing", "DevOps"];
const LVLS = ["beginner", "intermediate", "advanced"];

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", short_description: "", description: "",
    category: "Cybersecurity", level: "beginner",
    price: "", original_price: "", thumbnail_url: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/courses", {
        ...form,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
      });
      toast.success("Course created successfully!");
      router.push("/instructor");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Link href="/instructor" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-heading font-black text-primary mb-8">Create New Course</h1>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-8 space-y-5">
            <div>
              <label className="block text-sm font-heading font-semibold text-slate-700 mb-1.5">Course Title *</label>
              <input type="text" value={form.title} onChange={e => set("title", e.target.value)} required
                placeholder="e.g. Complete Ethical Hacking Bootcamp" className="input" />
            </div>
            <div>
              <label className="block text-sm font-heading font-semibold text-slate-700 mb-1.5">Short Description *</label>
              <input type="text" value={form.short_description} onChange={e => set("short_description", e.target.value)} required
                placeholder="One-line summary shown in course cards" className="input" />
            </div>
            <div>
              <label className="block text-sm font-heading font-semibold text-slate-700 mb-1.5">Full Description *</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} required rows={5}
                className="input resize-none" placeholder="Detailed course description..." />
            </div>
            <div>
              <label className="block text-sm font-heading font-semibold text-slate-700 mb-1.5">Thumbnail URL</label>
              <input type="url" value={form.thumbnail_url} onChange={e => set("thumbnail_url", e.target.value)}
                placeholder="https://images.unsplash.com/..." className="input" />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-heading font-semibold text-slate-700 mb-1.5">Category</label>
                <select value={form.category} onChange={e => set("category", e.target.value)} className="input bg-white">
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-heading font-semibold text-slate-700 mb-1.5">Level</label>
                <select value={form.level} onChange={e => set("level", e.target.value)} className="input bg-white capitalize">
                  {LVLS.map(l => <option key={l} className="capitalize">{l}</option>)}
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-heading font-semibold text-slate-700 mb-1.5">Price (KSh) *</label>
                <input type="number" value={form.price} onChange={e => set("price", e.target.value)} required
                  min="0" placeholder="10000" className="input" />
              </div>
              <div>
                <label className="block text-sm font-heading font-semibold text-slate-700 mb-1.5">Original Price (optional)</label>
                <input type="number" value={form.original_price} onChange={e => set("original_price", e.target.value)}
                  min="0" placeholder="15000" className="input" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4">
              <Save className="w-4 h-4" />
              {loading ? "Creating..." : "Create Course"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
