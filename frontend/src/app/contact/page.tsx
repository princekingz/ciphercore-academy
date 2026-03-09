"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Message sent! We will get back to you within 24 hours.");
    setForm({ name:"", email:"", subject:"", message:"" });
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="pt-16">
        <section className="bg-primary py-20">
          <div className="container max-w-3xl">
            <h1 className="text-5xl font-heading font-black text-white mb-4">Get in Touch</h1>
            <p className="text-slate-300 text-xl">We are here to help. Reach out anytime.</p>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container">
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="space-y-4">
                {[
                  { icon: Mail, label:"Email", value:"hello@ciphercoreacademy.com" },
                  { icon: Phone, label:"Phone", value:"+254 700 000 000" },
                  { icon: MapPin, label:"Location", value:"Nairobi, Kenya" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-2xl p-5 flex gap-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-primary text-sm">{label}</p>
                      <p className="text-slate-500 text-sm">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-2 bg-slate-50 rounded-2xl p-8">
                <h2 className="font-heading font-bold text-primary text-xl mb-6">Send a message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Name</label>
                      <input type="text" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required className="input" />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required className="input" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Subject</label>
                    <input type="text" value={form.subject} onChange={e => setForm({...form, subject:e.target.value})} required className="input" />
                  </div>
                  <div>
                    <label className="label">Message</label>
                    <textarea value={form.message} onChange={e => setForm({...form, message:e.target.value})} required rows={5}
                      className="input resize-none" />
                  </div>
                  <button type="submit" disabled={loading} className="btn-blue">
                    <Send className="w-4 h-4" />{loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
