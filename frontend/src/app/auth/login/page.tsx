"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",backgroundSize:"40px 40px"}} />
        <Link href="/" className="inline-flex items-center gap-2.5 relative">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-heading font-bold text-white text-lg leading-none">CipherCore</p>
            <p className="text-accent text-[9px] font-heading font-semibold uppercase tracking-widest">Academy</p>
          </div>
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-heading font-black text-white mb-4 leading-tight">
            Welcome back to your learning journey
          </h2>
          <p className="text-slate-400 leading-relaxed mb-10">
            Continue where you left off. Your courses, progress, and certificates are waiting.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[{v:"12K+",l:"Students"},{v:"110+",l:"Courses"},{v:"98%",l:"Job placement"},{v:"4.9★",l:"Rating"}].map(({v,l}) => (
              <div key={l} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="font-heading font-black text-white text-2xl">{v}</p>
                <p className="text-slate-400 text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-500 text-xs relative">&copy; {new Date().getFullYear()} CipherCore Academy</p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h1 className="text-2xl font-heading font-black text-primary mb-1.5">Sign in</h1>
            <p className="text-slate-500 text-sm mb-8">
              New to CipherCore?{" "}
              <Link href="/auth/register" className="text-secondary font-semibold hover:underline">Create an account</Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-heading font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@example.com"
                    className="input pl-11"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-heading font-semibold text-slate-700">Password</label>
                  <Link href="/auth/forgot-password" className="text-secondary text-sm hover:underline">Forgot?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="Enter your password"
                    className="input pl-11 pr-11"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 bg-secondary text-white rounded-xl font-heading font-semibold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
