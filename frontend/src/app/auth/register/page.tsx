"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, User, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords do not match");
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Account created! Welcome to CipherCore.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    "Access 110+ tech courses",
    "Industry-recognized certificates",
    "Pay with M-Pesa",
    "Join 12,000+ student community",
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left */}
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
            Join Africa&#39;s fastest-growing tech community
          </h2>
          <p className="text-slate-400 leading-relaxed mb-10">
            Start your tech career today. No prior experience needed.
          </p>
          <div className="space-y-3">
            {perks.map(p => (
              <div key={p} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                <span className="text-slate-300 text-sm">{p}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-500 text-xs relative">&copy; {new Date().getFullYear()} CipherCore Academy</p>
      </div>

      {/* Right */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h1 className="text-2xl font-heading font-black text-primary mb-1.5">Create your account</h1>
            <p className="text-slate-500 text-sm mb-8">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-secondary font-semibold hover:underline">Sign in</Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-heading font-semibold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required
                    placeholder="John Kamau" className="input pl-11" autoComplete="name" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-heading font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@example.com" className="input pl-11" autoComplete="email" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-heading font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="Min. 8 characters" className="input pl-11 pr-11" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-heading font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                    placeholder="Repeat your password" className="input pl-11" autoComplete="new-password" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 bg-secondary text-white rounded-xl font-heading font-semibold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="text-xs text-slate-400 text-center mt-5">
              By signing up you agree to our{" "}
              <Link href="/terms" className="text-secondary hover:underline">Terms</Link> and{" "}
              <Link href="/privacy" className="text-secondary hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
