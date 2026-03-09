"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Menu, X, ChevronDown, LogOut, LayoutDashboard, BookOpen } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const navLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenu(false);
    router.push("/");
  };

  const isDark = !scrolled && (pathname === "/" || pathname === "/about" || pathname === "/pricing");

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100" : isDark ? "bg-transparent" : "bg-white border-b border-slate-100"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className={`font-heading font-bold text-[15px] leading-none ${isDark && !scrolled ? "text-white" : "text-primary"}`}>CipherCore</p>
            <p className="text-accent text-[9px] font-heading font-semibold uppercase tracking-widest leading-none mt-0.5">Academy</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`px-4 py-2 rounded-lg text-sm font-heading font-medium transition-all ${
                pathname === href
                  ? "text-secondary bg-secondary/10"
                  : isDark && !scrolled
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-slate-600 hover:text-primary hover:bg-slate-100"
              }`}>
              {label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenu(!userMenu)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  isDark && !scrolled ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
                }`}>
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center text-white text-xs font-heading font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-heading font-medium">{user.name.split(" ")[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              {userMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-1">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-heading font-semibold text-primary">{user.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                  </div>
                  <Link href="/dashboard" onClick={() => setUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
                  </Link>
                  {(user.role === "instructor" || user.role === "admin") && (
                    <Link href="/instructor" onClick={() => setUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      <BookOpen className="w-4 h-4 text-slate-400" /> Instructor Panel
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors w-full">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login"
                className={`text-sm font-heading font-medium px-4 py-2.5 rounded-xl transition-all ${
                  isDark && !scrolled ? "text-white/80 hover:text-white hover:bg-white/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"
                }`}>
                Sign In
              </Link>
              <Link href="/auth/register" className="btn-primary text-sm py-2.5 px-5">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className={`md:hidden p-2 rounded-lg ${isDark && !scrolled ? "text-white" : "text-slate-700"}`}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-heading font-medium text-slate-700 hover:bg-slate-50">
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <button onClick={handleLogout} className="btn-outline text-center justify-center w-full text-sm">Sign Out</button>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setOpen(false)} className="btn-ghost justify-center border border-slate-200 text-sm">Sign In</Link>
                <Link href="/auth/register" onClick={() => setOpen(false)} className="btn-primary justify-center text-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
