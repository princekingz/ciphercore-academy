"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CourseCard from "@/components/ui/CourseCard";
import api from "@/lib/api";
import {
  Shield, Code, Brain, BarChart2, Cloud,
  ArrowRight, CheckCircle2, Star, Users, BookOpen, Award,
  Play, Quote, ChevronRight, Zap, Globe
} from "lucide-react";

const DEMO_COURSES = [
  { id:"1", title:"Complete Ethical Hacking & Penetration Testing", slug:"ethical-hacking", category:"Cybersecurity", level:"beginner", price:15000, original_price:20000, instructor_name:"James Kariuki", enrollment_count:2340, avg_rating:4.9, review_count:342, short_description:"Learn to think like a hacker. Master network scanning, exploitation, and reporting." },
  { id:"2", title:"Full-Stack Web Development: React & Node.js", slug:"fullstack-web", category:"Web Development", level:"intermediate", price:12000, original_price:18000, instructor_name:"Sarah Mwangi", enrollment_count:1820, avg_rating:4.8, review_count:281, short_description:"Build real-world web apps from scratch. Frontend, backend, databases, deployment." },
  { id:"3", title:"Machine Learning & AI for Beginners", slug:"ml-ai", category:"AI", level:"beginner", price:18000, original_price:25000, instructor_name:"Dr. Peter Odhiambo", enrollment_count:1240, avg_rating:4.9, review_count:198, short_description:"No math PhD required. Learn ML with Python, from regression to neural networks." },
  { id:"4", title:"AWS Cloud Practitioner — Certification Prep", slug:"aws-cloud", category:"Cloud Computing", level:"beginner", price:10000, original_price:14000, instructor_name:"Grace Auma", enrollment_count:987, avg_rating:4.7, review_count:154, short_description:"Pass the AWS CLF-C02 exam on your first attempt. Structured, practical, exam-focused." },
  { id:"5", title:"Data Analysis with Python, SQL & Power BI", slug:"data-analysis", category:"Data Analysis", level:"beginner", price:11000, original_price:15000, instructor_name:"Moses Otieno", enrollment_count:1560, avg_rating:4.8, review_count:223, short_description:"Turn raw data into insights. Real datasets, real dashboards, real skills." },
  { id:"6", title:"Advanced Red Teaming & Exploit Development", slug:"red-teaming", category:"Cybersecurity", level:"advanced", price:20000, original_price:28000, instructor_name:"Njoroge Kamau", enrollment_count:740, avg_rating:5.0, review_count:89, short_description:"Elite offensive security: custom exploits, evasion, Active Directory attacks." },
];

const TESTIMONIALS = [
  {
    name: "Amina Wanjiku", role: "Security Analyst @ Rappi ", rating: 5,
    text: "I went from zero cybersecurity knowledge to landing a job at Safaricom in 7 months. The ethical hacking course was incredibly hands-on — I was running actual attacks in a lab by week two.",
    photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&auto=format&fit=crop&q=80",
  },
  {
    name: "David Ochieng", role: "Full-Stack Developer @ Loft (Brazil)", rating: 5,
    text: "The web dev curriculum is seriously comprehensive. React, Node.js, databases, deployment — everything you actually need. I got my Andela offer 2 weeks after finishing the bootcamp.",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&auto=format&fit=crop&q=80",
  },
  {
    name: "Fatuma Hassan", role: "Data Analyst @ Tech Hub", rating: 5,
    text: "Coming from an accounting background I was nervous, but the Data Analysis course meets you where you are. The Power BI project I built in the final week is now used daily at my job.",
    photo: "",
  },
];

const CATEGORIES = [
  { icon: Shield, label: "Cybersecurity", count: 24, color: "from-blue-600 to-blue-900", photo: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop" },
  { icon: Code, label: "Web Development", count: 31, color: "from-violet-600 to-violet-900", photo: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&auto=format&fit=crop" },
  { icon: Brain, label: "Artificial Intelligence", count: 18, color: "from-pink-600 to-rose-900", photo: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&auto=format&fit=crop" },
  { icon: BarChart2, label: "Data Analysis", count: 22, color: "from-orange-500 to-orange-900", photo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop" },
  { icon: Cloud, label: "Cloud Computing", count: 15, color: "from-cyan-600 to-cyan-900", photo: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&auto=format&fit=crop" },
];

const STATS = [
  { value: "12,400+", label: "Students Trained" },
  { value: "Top Grads", label: "Work at CipherCore" },
  { value: "110+", label: "Courses" },
  { value: "4.9★", label: "Average Rating" },
];

const PRICING = [
  {
    name: "Starter", price: 10000, highlight: false,
    features: ["Access to 5 courses", "Completion certificates", "Community forum", "Email support"],
  },
  {
    name: "Professional", price: 15000, highlight: true,
    features: ["All 110+ courses", "Priority certificates", "2 mentorship sessions/month", "Career counseling", "Career development support", "Discord VIP"],
  },
  {
    name: "Bootcamp", price: 20000, highlight: false,
    features: ["Everything in Pro", "Live cohort training", "Daily instructor access", "Project reviews", "12-month job support"],
  },
];

export default function Home() {
  const [courses, setCourses] = useState(DEMO_COURSES);

  useEffect(() => {
    api.get("/courses/featured").then(res => {
      if (res.data.courses?.length > 0) setCourses(res.data.courses);
    }).catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <main>
        {/* ===== HERO ===== */}
        <section className="relative min-h-screen flex items-center bg-primary overflow-hidden pt-16">
          {/* Background image with overlay */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&auto=format&fit=crop&q=80"
              alt="Students learning"
              fill className="object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/80" />
          </div>

          {/* Grid texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent text-xs font-heading font-semibold mb-8">
                <Zap className="w-3.5 h-3.5" />
                Africa&#39;s #1 Tech Education Platform
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-black text-white leading-[1.05] mb-6">
                Learn Real Tech<br />Skills That{" "}
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-cyan-400">Get You Hired</span>
                </span>
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-xl">
                Cybersecurity, Web Development, AI, Data Analysis, Cloud Computing.
                Taught by industry professionals. Priced for Africa.
                Pay with M-Pesa.
              </p>

              <div className="flex flex-wrap gap-4 mb-14">
                <Link href="/courses" className="btn-primary text-base px-8 py-4">
                  Browse Courses <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/pricing" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-heading font-semibold hover:bg-white/10 transition-all text-base">
                  View Pricing
                </Link>
              </div>

              <div className="flex flex-wrap gap-5">
                {[
                  "No experience needed",
                  "Pay with M-Pesa",
                  "Lifetime access",
                ].map(t => (
                  <div key={t} className="flex items-center gap-2 text-slate-400 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATS.map(({ value, label }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-center backdrop-blur-sm">
                  <p className="text-2xl font-heading font-black text-white mb-0.5">{value}</p>
                  <p className="text-slate-400 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CATEGORIES ===== */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-secondary font-heading font-semibold text-sm uppercase tracking-widest mb-2">What You Will Learn</p>
              <h2 className="section-title">5 High-Demand Disciplines</h2>
              <p className="text-slate-500 mt-3 max-w-xl mx-auto">Every course is built around what tech employers are actually hiring for right now.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {CATEGORIES.map(({ icon: Icon, label, count, color, photo }) => (
                <Link href={`/courses?category=${label}`} key={label}
                  className="group relative overflow-hidden rounded-2xl aspect-[3/4] flex flex-col justify-end">
                  <Image src={photo} alt={label} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent`} />
                  <div className="relative p-5">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
                      <Icon className="w-4.5 h-4.5 text-white w-5 h-5" />
                    </div>
                    <p className="font-heading font-bold text-white text-sm leading-tight mb-1">{label}</p>
                    <p className="text-white/60 text-xs">{count} courses</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FEATURED COURSES ===== */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <p className="text-secondary font-heading font-semibold text-sm uppercase tracking-widest mb-2">Top Rated</p>
                <h2 className="section-title">Featured Courses</h2>
              </div>
              <Link href="/courses" className="btn-outline text-sm shrink-0">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((c: any) => <CourseCard key={c.id} course={c} />)}
            </div>
          </div>
        </section>

        {/* ===== WHY CIPHERCORE ===== */}
        <section className="py-24 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-accent font-heading font-semibold text-sm uppercase tracking-widest mb-3">Why CipherCore</p>
                <h2 className="text-4xl font-heading font-black text-white mb-6 leading-tight">
                  Built for the African Tech Talent Pipeline
                </h2>
                <p className="text-slate-400 leading-relaxed mb-10">
                  We are not just another online course platform. We are a career accelerator built specifically for African students, with local pricing, M-Pesa payments, and curriculum designed around what employers in Nairobi, Lagos, and Accra are hiring for.
                </p>
                <div className="space-y-5">
                  {[
                    { icon: "🎯", title: "Industry-Aligned Curriculum", desc: "Built with input from tech companies across Kenya, Nigeria, and Ghana." },
                    { icon: "📱", title: "Pay with M-Pesa", desc: "No dollar card required. Pay easily with Safaricom M-Pesa or card." },
                    { icon: "💼", title: "Job-Ready Portfolio Projects", desc: "Every course ends with a real project you can show to employers." },
                    { icon: "🤝", title: "Mentorship & Community", desc: "Join 12,000+ students on Discord. Get matched with an industry mentor." },
                    { icon: "📅", title: "Flexible Intakes", desc: "New cohorts start every quarter. April 2026 intake is now open — reserve your spot today." },
{ icon: "💻", title: "Online & Hybrid Learning", desc: "Learn from anywhere in Africa. Live sessions on Google Meet with recorded replays." },                

                  ].map(({ icon, title, desc }) => (
                    <div key={title} className="flex gap-4">
                      <div className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center text-xl shrink-0">{icon}</div>
                      <div>
                        <p className="font-heading font-semibold text-white mb-0.5">{title}</p>
                        <p className="text-slate-400 text-sm">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                  <p className="font-heading font-bold text-white text-xl mb-6">Student Outcomes</p>
                  {[
                    { label: "Top Graduates Join Our Team", val: 100, color: "bg-accent" },
                    { label: "Course Completion Rate", val: 87, color: "bg-secondary" },
                    { label: "Student Satisfaction", val: 96, color: "bg-purple-500" },
                    { label: "Average Salary Increase", val: 73, color: "bg-orange-400" },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="mb-5 last:mb-0">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300">{label}</span>
                        <span className="text-white font-heading font-bold">{val}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 text-center gap-4">
                    {[{v:"12K+",l:"Students"},{v:"110+",l:"Courses"},{v:"4.9★",l:"Rating"}].map(({v,l}) => (
                      <div key={l}>
                        <p className="font-heading font-black text-white text-xl">{v}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{l}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Floating card */}
                <div className="absolute -bottom-5 -right-5 bg-accent rounded-2xl p-4 shadow-2xl shadow-green-500/20">
  <p className="font-heading font-black text-white text-2xl">🏆</p>
  <p className="text-green-100 text-xs font-heading">Top grads join our team</p>
</div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-secondary font-heading font-semibold text-sm uppercase tracking-widest mb-2">Student Stories</p>
              <h2 className="section-title">Real People, Real Careers</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map(({ name, role, text, photo, rating }) => (
                <div key={name} className="bg-white rounded-2xl p-7 border border-slate-200 hover:border-secondary/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                  <div className="flex mb-4">
                    {[...Array(rating)].map((_,i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">&ldquo;{text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <Image src={photo} alt={name} width={44} height={44} className="rounded-full object-cover" />
                    <div>
                      <p className="font-heading font-semibold text-primary text-sm">{name}</p>
                      <p className="text-slate-500 text-xs">{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRICING ===== */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-secondary font-heading font-semibold text-sm uppercase tracking-widest mb-2">Pricing</p>
              <h2 className="section-title">Simple, Honest Pricing</h2>
              <p className="text-slate-500 mt-3">All prices in Kenyan Shillings. Pay with M-Pesa, Visa, or PayPal.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {PRICING.map(({ name, price, highlight, features }) => (
                <div key={name} className={`rounded-3xl p-8 relative ${highlight ? "bg-primary text-white shadow-2xl shadow-blue-500/20 scale-105" : "bg-white border-2 border-slate-200"}`}>
                  {highlight && (
                    <div className="absolute -top-4 inset-x-0 flex justify-center">
                      <span className="bg-secondary text-white px-5 py-1.5 rounded-full text-xs font-heading font-bold shadow-lg">MOST POPULAR</span>
                    </div>
                  )}
                  <p className={`font-heading font-bold text-xl mb-1 ${highlight ? "text-white" : "text-primary"}`}>{name}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className={`text-4xl font-heading font-black ${highlight ? "text-white" : "text-primary"}`}>KSh {price.toLocaleString()}</span>
                    <span className={`text-sm ${highlight ? "text-slate-400" : "text-slate-500"}`}>/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                        <span className={highlight ? "text-slate-300" : "text-slate-600"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register"
                    className={`block text-center py-3.5 rounded-xl font-heading font-semibold text-sm transition-all ${highlight ? "bg-secondary text-white hover:bg-blue-700" : "bg-primary text-white hover:bg-slate-800"}`}>
                    Get Started →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="py-24 bg-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="max-w-3xl mx-auto px-4 text-center relative">
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-5 leading-tight">
              Your Tech Career Starts Today
            </h2>
            <p className="text-slate-300 text-xl mb-10">
              Join 12,400+ students who have already transformed their careers.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/auth/register" className="btn-accent text-base px-10 py-4">
                Start Learning <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/courses" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl border-2 border-white/20 text-white font-heading font-semibold hover:bg-white/10 transition-all text-base">
                Browse Courses
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
