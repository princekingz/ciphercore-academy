"use client";
import { useState } from "react";
import Link from "next/link";
import { Shield, Mail, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mb-5">
            <Mail className="w-6 h-6 text-secondary" />
          </div>
          {sent ? (
            <>
              <h1 className="text-2xl font-heading font-black text-primary mb-2">Check your email</h1>
              <p className="text-slate-500 text-sm">If an account exists for <strong>{email}</strong>, we sent a password reset link.</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-heading font-black text-primary mb-1.5">Reset your password</h1>
              <p className="text-slate-500 text-sm mb-7">Enter your email and we will send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-heading font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="you@example.com" className="input pl-11" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-secondary text-white rounded-xl font-heading font-semibold text-sm hover:bg-blue-700 transition-all disabled:opacity-60">
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
