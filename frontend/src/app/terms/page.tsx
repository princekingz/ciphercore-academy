import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const sections = [
  { q: "1. Acceptance", a: "By using CipherCore Academy you agree to these terms. If you disagree, please do not use our platform." },
  { q: "2. Course Access", a: "Upon payment you gain personal, non-commercial access to course materials for your subscription period." },
  { q: "3. Payments & Refunds", a: "We accept M-Pesa, Visa, and PayPal. A 7-day refund is available if less than 20% of course content has been accessed." },
  { q: "4. Certificates", a: "Certificates are issued upon 100% course completion and are digitally verifiable via our platform." },
  { q: "5. Intellectual Property", a: "All content is owned by CipherCore Academy or respective instructors. Redistribution is strictly prohibited." },
  { q: "6. Account Security", a: "You are responsible for keeping your account credentials secure. Report any suspected breach immediately." },
  { q: "7. Contact", a: "Questions? Email legal@ciphercoreacademy.com" },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="pt-16 bg-slate-50 min-h-screen">
        <div className="bg-primary py-14">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-heading font-black text-white">Terms of Service</h1>
            <p className="text-slate-400 mt-2 text-sm">Last updated: January 2025</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-14 space-y-8">
          {sections.map(({ q, a }) => (
            <div key={q}>
              <h2 className="text-lg font-heading font-bold text-primary mb-2">{q}</h2>
              <p className="text-slate-600 leading-relaxed text-sm">{a}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
