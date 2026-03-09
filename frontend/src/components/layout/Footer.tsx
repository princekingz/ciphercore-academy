import Link from "next/link";
import { Shield, Twitter, Linkedin, Youtube, Github, MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-primary text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-heading font-bold text-white text-xl leading-none">CipherCore</p>
                <p className="text-accent text-[10px] font-heading font-semibold uppercase tracking-widest mt-0.5">Academy</p>
              </div>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs mb-6">
              Africa&#39;s leading tech education platform. We teach skills that get you hired — from Nairobi to the world.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Youtube, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-white/5 hover:bg-secondary rounded-lg flex items-center justify-center transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white font-heading font-semibold text-sm mb-4">Courses</p>
            <ul className="space-y-3 text-sm">
              {["Cybersecurity", "Web Development", "Artificial Intelligence", "Data Analysis", "Cloud Computing"].map(c => (
                <li key={c}><Link href={`/courses?category=${c}`} className="hover:text-white transition-colors">{c}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white font-heading font-semibold text-sm mb-4">Company</p>
            <ul className="space-y-3 text-sm">
              {[{l:"About",h:"/about"},{l:"Pricing",h:"/pricing"},{l:"Contact",h:"/contact"},{l:"Terms",h:"/terms"},{l:"Privacy",h:"/privacy"}].map(({l,h}) => (
                <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white font-heading font-semibold text-sm mb-4">Contact</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5"><MapPin className="w-4 h-4 text-accent shrink-0" />Nairobi, Kenya</li>
              <li className="flex items-center gap-2.5"><Mail className="w-4 h-4 text-accent shrink-0" />hello@ciphercoreacademy.com</li>
              <li className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-accent shrink-0" />+254 700 000 000</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
          <p>&copy; {year} CipherCore Academy. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
