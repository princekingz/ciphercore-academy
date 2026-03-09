import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const sections = [
  { q: "1. Data We Collect", a: "Name, email, payment info, course progress, and usage analytics to improve the platform." },
  { q: "2. How We Use It", a: "To provide services, process payments, send relevant communications, and improve your learning experience." },
  { q: "3. Data Sharing", a: "We never sell your data. We share only with payment processors and hosting providers as strictly needed." },
  { q: "4. Security", a: "Industry-standard encryption. Passwords are hashed with bcrypt and never stored in plaintext." },
  { q: "5. Your Rights", a: "You can access, correct, or delete your data at any time. Email privacy@ciphercoreacademy.com." },
  { q: "6. Cookies", a: "Used for authentication and analytics. Controllable via browser settings." },
  { q: "7. Contact", a: "Privacy questions: privacy@ciphercoreacademy.com" },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="pt-16 bg-slate-50 min-h-screen">
        <div className="bg-primary py-14">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-heading font-black text-white">Privacy Policy</h1>
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
