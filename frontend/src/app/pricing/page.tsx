import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

const PLANS = [
  { name:"Starter", price:10000, desc:"Perfect to get started", highlight:false,
    features:["Access to 5 courses","Completion certificates","Community forum","Email support","Mobile & desktop"] },
  { name:"Professional", price:15000, desc:"Most popular choice", highlight:true,
    features:["Access to ALL courses","Priority certificates","2 mentorship sessions/month","Career counseling","Job placement help","Lifetime updates","Discord VIP"] },
  { name:"Bootcamp", price:20000, desc:"Intensive fast-track", highlight:false,
    features:["Everything in Professional","Live cohort training","Daily instructor access","Project feedback","Industry network","Interview prep","12-month job support"] },
];

export default function PricingPage() {
  return (
    <>
      <Navbar dark />
      <div className="pt-16">
        <section className="bg-primary py-20 text-center">
          <div className="container max-w-2xl">
            <h1 className="text-5xl font-heading font-black text-white mb-4">Simple, Honest Pricing</h1>
            <p className="text-slate-300 text-xl">All prices in Kenyan Shillings. Pay with M-Pesa, Visa, or PayPal.</p>
          </div>
        </section>

        <section className="section bg-slate-50">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {PLANS.map(({ name, price, desc, highlight, features }) => (
                <div key={name} className={`rounded-3xl p-8 ${highlight ? "bg-primary ring-2 ring-secondary shadow-2xl shadow-blue-500/15 scale-105" : "bg-white border border-slate-200"}`}>
                  {highlight && (
                    <div className="text-center mb-5">
                      <span className="bg-secondary text-white px-4 py-1.5 rounded-full text-xs font-heading font-bold uppercase tracking-wide">Most Popular</span>
                    </div>
                  )}
                  <h2 className={`font-heading font-black text-2xl mb-1 ${highlight ? "text-white" : "text-primary"}`}>{name}</h2>
                  <p className={`text-sm mb-5 ${highlight ? "text-slate-400" : "text-slate-500"}`}>{desc}</p>
                  <div className="mb-7">
                    <span className={`text-5xl font-heading font-black ${highlight ? "text-white" : "text-primary"}`}>KSh {price.toLocaleString()}</span>
                    <span className={`text-sm ml-1 ${highlight ? "text-slate-400" : "text-slate-500"}`}>/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span className={highlight ? "text-slate-300" : "text-slate-600"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register"
                    className={`block text-center py-4 rounded-xl font-heading font-semibold text-sm transition-all ${
                      highlight ? "bg-secondary text-white hover:bg-blue-700" : "bg-primary text-white hover:bg-slate-800"
                    }`}>
                    Get Started →
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-16 bg-white rounded-3xl border border-slate-100 p-8 max-w-3xl mx-auto">
              <h3 className="font-heading font-bold text-primary text-xl mb-5 text-center">Frequently Asked Questions</h3>
              <div className="space-y-5">
                {[
                  { q:"Can I pay with M-Pesa?", a:"Yes! We accept M-Pesa, Visa/Mastercard, and PayPal. All prices are in Kenyan Shillings." },
                  { q:"Is there a refund policy?", a:"Yes. We offer a 7-day refund if you have accessed less than 20% of the course content." },
                  { q:"Do I get lifetime access?", a:"Yes. Once you enroll, you have lifetime access to the course including all future updates." },
                  { q:"Are the certificates recognized?", a:"Our certificates are digitally verifiable and recognized by our 50+ hiring partner companies." },
                ].map(({ q, a }) => (
                  <div key={q} className="border-b border-slate-100 pb-5">
                    <h4 className="font-heading font-semibold text-primary mb-1.5">{q}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
