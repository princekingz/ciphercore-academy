import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Target, Heart, Shield, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="pt-16">
        <section className="bg-primary py-20">
          <div className="container max-w-3xl">
            <h1 className="text-5xl font-heading font-black text-white mb-5">About CipherCore Academy</h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              On a mission to build Africa&#39;s next generation of world-class tech talent.
            </p>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-secondary font-heading font-semibold text-sm uppercase tracking-widest mb-3">Our Story</p>
                <h2 className="text-4xl font-heading font-black text-primary mb-6">Built in Nairobi, for the World</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  CipherCore Academy was founded in 2022 by cybersecurity professionals and software engineers who saw a massive gap: 
                  African developers were talented but lacked access to practical, affordable, job-ready training.
                </p>
                <p className="text-slate-600 leading-relaxed mb-4">
                  We built the platform we wished existed — deeply practical, taught by professionals who work in the industry, 
                  and priced for everyone from Nairobi to Lagos to Accra.
                </p>
                <p className="text-slate-600 leading-relaxed mb-8">
                  Today CipherCore Academy has helped over 12,400 students launch or level up their tech careers.
                </p>
                <Link href="/courses" className="btn-blue">Browse Courses <ArrowRight className="w-4 h-4" /></Link>
              </div>
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
                <Image src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80"
                  alt="Team" fill className="object-cover" unoptimized />
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-slate-50">
          <div className="container">
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Target, title:"Our Mission", desc:"Make world-class tech education accessible to every African student." },
                { icon: Heart, title:"Our Values", desc:"Practical skills, community, affordability, and real results." },
                { icon: Shield, title:"Our Focus", desc:"Cybersecurity, Web Dev, AI, Data, Cloud — skills companies hire for." },
                { icon: Globe, title:"Our Reach", desc:"Students in 30+ countries. Hiring partners worldwide." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100">
                  <div className="w-11 h-11 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="font-heading font-bold text-primary mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
