"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  Star, Users, Clock, CheckCircle2, Play, Lock,
  ArrowLeft, Award, Globe, BarChart2, ChevronDown, ChevronUp
} from "lucide-react";

const PHOTOS: Record<string, string> = {
  "Cybersecurity": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop",
  "Web Development": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop",
  "AI": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop",
  "Data Analysis": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop",
  "Cloud Computing": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop",
  "DevOps": "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop",
};

export default function CourseDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, loadUser } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [phone, setPhone] = useState("");
const [reviews, setReviews] = useState<any[]>([]);
const [sessions, setSessions] = useState<any[]>([]);
const [newRating, setNewRating] = useState(0);
const [newComment, setNewComment] = useState("");

  useEffect(() => {
    loadUser();
    fetchCourse();
  }, [slug]);

  useEffect(() => {
    if (user && course) { checkEnrollment(); fetchReviews(); fetchSessions(); }
  }, [user, course]);

  const fetchCourse = async () => {
    try {
      const { data } = await api.get(`/courses/${slug}`);
      setCourse(data.course);
      // fetch modules
      try {
        const { data: md } = await api.get(`/courses/${data.course.id}/modules`);
        setModules(md.modules || []);
        if (md.modules?.length > 0) setActiveModule(md.modules[0].id);
      } catch {}
    } catch {
      toast.error("Course not found");
      router.push("/courses");
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const { data } = await api.get(`/enrollments/check/${course.id}`);
      setEnrolled(data.enrolled);
    } catch {}
  };
const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/course/${course?.id}`);
      setReviews(data.reviews || []);
    } catch {}
  };
 const fetchSessions = async () => {
    try {
      const { data } = await api.get(`/live-sessions/course/${course?.id}`);
      setSessions(data.sessions || []);
    } catch {}
  };

  const handleEnrollFree = async () => {
    if (!user) { router.push("/auth/login"); return; }
    setEnrolling(true);
    try {
      await api.post("/payments/enroll-free", { courseId: course.id });
      setEnrolled(true);
      toast.success("Enrolled successfully!");
    } catch {
      toast.error("Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  const handleMpesa = async () => {
    if (!user) { router.push("/auth/login"); return; }
    if (!phone) { toast.error("Enter your M-Pesa phone number"); return; }
    setEnrolling(true);
    try {
      await api.post("/payments/mpesa/initiate", { phoneNumber: phone, courseId: course.id });
      toast.success("Check your phone for the M-Pesa prompt!");
      setShowPayment(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "M-Pesa failed. Try again.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-16">
        <div className="w-10 h-10 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  );

  if (!course) return null;

  const photo = course.thumbnail_url || PHOTOS[course.category] || PHOTOS["Web Development"];
  const rating = parseFloat(String(course.avg_rating || 0)).toFixed(1);
  const students = parseInt(String(course.enrollment_count || 0));

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-slate-50">
        {/* Hero */}
        <div className="bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href="/courses" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Courses
            </Link>
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <span className="inline-block px-3 py-1 bg-secondary/20 text-blue-300 text-xs font-heading font-bold rounded-full uppercase tracking-wider mb-4">
                  {course.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-heading font-black text-white mb-4 leading-tight">
                  {course.title}
                </h1>
                <p className="text-slate-300 text-base leading-relaxed mb-6">
                  {course.short_description || course.description?.slice(0, 150)}
                </p>
                <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400 mb-6">
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-white font-semibold">{rating}</span>
                    <span>({course.review_count} reviews)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {students.toLocaleString()} students
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4" />
                    <span className="capitalize">{course.level}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    English
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  Created by <span className="text-white font-medium">{course.instructor_name}</span>
                </p>
              </div>

              {/* Enrollment Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl sticky top-24">
                  <div className="relative h-48">
                    <Image src={photo} alt={course.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-heading font-black text-primary">
                        KSh {parseInt(course.price).toLocaleString()}
                      </span>
                      {course.original_price && (
                        <span className="text-slate-400 text-sm line-through">
                          KSh {parseInt(course.original_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {course.original_price && (
                      <p className="text-accent text-xs font-heading font-bold mb-4">
                        {Math.round((1 - course.price / course.original_price) * 100)}% OFF
                      </p>
                    )}

                    {enrolled ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-accent font-heading font-semibold text-sm">
                          <CheckCircle2 className="w-5 h-5" /> You are enrolled!
                        </div>
                        {activeLesson?.video_url && (
                          <a href={`https://www.youtube.com/watch?v=${activeLesson.video_url}`} target="_blank" rel="noopener noreferrer"
                            className="btn-primary w-full justify-center text-sm py-3">
                            <Play className="w-4 h-4" /> Continue Learning
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                 
                           {!showPayment ? (
  <>
    <button onClick={() => setShowPayment(true)}
      className="w-full py-3.5 bg-secondary text-white rounded-xl font-heading font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
      Enroll Now
    </button>
  </>
                        
                        ) : (
                          <div className="space-y-3">
                            <p className="font-heading font-bold text-primary text-sm">Pay with M-Pesa</p>
                            <input
                              type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                              placeholder="07XX XXX XXX" className="input text-sm"
                            />
                            <button onClick={handleMpesa} disabled={enrolling}
                              className="w-full py-3.5 bg-accent text-white rounded-xl font-heading font-bold text-sm hover:bg-green-600 transition-all disabled:opacity-60">
                              {enrolling ? "Sending prompt..." : "Pay KSh " + parseInt(course.price).toLocaleString()}
                            </button>
                            <button onClick={() => setShowPayment(false)} className="w-full text-slate-400 text-xs hover:text-slate-600 transition-colors">
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100">
                      {[
                        { icon: Globe, text: "Full lifetime access" },
                        { icon: Award, text: "Certificate of completion" },
                        { icon: Clock, text: "Learn at your own pace" },
                      ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-2.5 text-xs text-slate-500">
                          <Icon className="w-4 h-4 text-slate-400" /> {text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">

              {/* What you'll learn */}
              {course.what_you_learn?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-7">
                  <h2 className="font-heading font-bold text-primary text-xl mb-5">What you will learn</h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {course.what_you_learn.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Content / Modules */}
              <div className="bg-white rounded-2xl border border-slate-200 p-7">
                <h2 className="font-heading font-bold text-primary text-xl mb-2">Course Content</h2>
                <p className="text-slate-500 text-sm mb-5">{modules.length} modules</p>

                {modules.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <Play className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Lessons coming soon</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {modules.map((mod: any) => (
                      <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden">
                        <button onClick={() => setActiveModule(activeModule === mod.id ? null : mod.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors">
                          <span className="font-heading font-semibold text-primary text-sm">{mod.title}</span>
                          {activeModule === mod.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                        {activeModule === mod.id && mod.lessons?.map((lesson: any) => (
                          <div key={lesson.id}
                            onClick={() => enrolled || lesson.is_preview ? setActiveLesson(lesson) : toast.error("Enroll to access this lesson")}
                            className="flex items-center gap-3 px-4 py-3 border-t border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                            {enrolled || lesson.is_preview
                              ? <Play className="w-4 h-4 text-secondary shrink-0" />
                              : <Lock className="w-4 h-4 text-slate-300 shrink-0" />
                            }
                            <span className="text-sm text-slate-600 flex-1">{lesson.title}</span>
                            {lesson.is_preview && <span className="text-xs text-accent font-heading font-semibold">Preview</span>}
                            {lesson.duration > 0 && <span className="text-xs text-slate-400">{Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2,'0')}</span>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
             
              {/* Live Sessions */}
              {enrolled && sessions.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-7">
                  <h2 className="font-heading font-bold text-primary text-xl mb-4">📅 Live Sessions</h2>
                  <div className="space-y-3">
                    {sessions.map((s: any) => {
                      const sessionDate = new Date(s.scheduled_at);
                      const now = new Date();
                      const isLive = now >= sessionDate && now <= new Date(sessionDate.getTime() + s.duration_minutes * 60000);
                      const isPast = now > new Date(sessionDate.getTime() + s.duration_minutes * 60000);
                      return (
                        <div key={s.id} className={`rounded-xl border p-4 flex items-center justify-between ${isLive ? "border-accent bg-accent/5" : "border-slate-200"}`}>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {isLive && <span className="text-xs font-heading font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full animate-pulse">🔴 LIVE NOW</span>}
                              {isPast && <span className="text-xs font-heading font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Ended</span>}
                              {!isLive && !isPast && <span className="text-xs font-heading font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">Upcoming</span>}
                              <p className="font-heading font-bold text-primary text-sm">{s.title}</p>
                            </div>
                            <p className="text-slate-400 text-xs">{sessionDate.toLocaleString()} · {s.duration_minutes} mins</p>
                            {s.description && <p className="text-slate-500 text-xs mt-1">{s.description}</p>}
                          </div>
                          {!isPast && (
                            <a href={s.meet_link} target="_blank"
                              onClick={async () => { try { await api.post(`/live-sessions/${s.id}/attend`); } catch {} }}
                              className={`text-sm font-heading font-bold px-4 py-2 rounded-xl shrink-0 ml-4 ${isLive ? "bg-accent text-white" : "bg-secondary text-white"}`}>
                              {isLive ? "Join Now" : "Join"}
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Take Exam Button */}
              {enrolled && (
                <div className="bg-white rounded-2xl border border-slate-200 p-7 flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-primary text-lg">Final Exam</h3>
                    <p className="text-slate-400 text-sm mt-1">Complete all lessons then take the final exam to earn your certificate</p>
                  </div>
                  <button onClick={() => router.push(`/courses/${slug}/exam`)} className="btn-primary shrink-0">
                    Take Exam
                  </button>
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-2xl border border-slate-200 p-7">
                <h2 className="font-heading font-bold text-primary text-xl mb-4">About this course</h2>
                <p className="text-slate-600 text-sm leading-relaxed">{course.description}</p>
              </div>
{/* Reviews */}
              <div className="bg-white rounded-2xl border border-slate-200 p-7">
                <h2 className="font-heading font-bold text-primary text-xl mb-6">Student Reviews</h2>
                {enrolled && (
                  <div className="mb-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-heading font-semibold text-primary text-sm mb-3">Leave a Review</p>
                    <div className="flex gap-2 mb-3">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} onClick={() => setNewRating(star)}
                          className={`text-2xl transition-transform hover:scale-110 ${star <= newRating ? "text-amber-400" : "text-slate-300"}`}>
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                      placeholder="Share your experience with this course..."
                      className="input w-full resize-none text-sm mb-3" rows={3}/>
                    <button onClick={async () => {
                      if (!newRating) { toast.error("Select a rating"); return; }
                      try {
                        await api.post(`/reviews/course/${course.id}`, { rating: newRating, comment: newComment });
                        toast.success("Review submitted!");
                        setNewRating(0);
                        setNewComment("");
                        fetchReviews();
                      } catch { toast.error("Failed to submit review"); }
                    }} className="btn-primary text-sm py-2 px-5">Submit Review</button>
                  </div>
                )}
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-sm">No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r: any) => (
                      <div key={r.id} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white font-heading font-bold shrink-0">
                          {r.user_name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-heading font-semibold text-primary text-sm">{r.user_name}</p>
                            <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-0.5 mb-2">
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className={`text-sm ${s <= r.rating ? "text-amber-400" : "text-slate-200"}`}>★</span>
                            ))}
                          </div>
                          <p className="text-slate-600 text-sm">{r.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Player (if lesson selected) */}
              {activeLesson?.video_url && (enrolled || activeLesson.is_preview) && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${activeLesson.video_url}`}
                      className="w-full h-full"
                      allowFullScreen
                      title={activeLesson.title}
                    />
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <h3 className="font-heading font-bold text-primary">{activeLesson.title}</h3>
                    {enrolled && (
                      <button
                        onClick={async () => {
                          try {
                            await api.post(`/enrollments/complete-lesson`, { lessonId: activeLesson.id, courseId: course.id });
                            toast.success("Lesson marked as complete! 🎉");
                            setActiveLesson({ ...activeLesson, completed: true });
                          } catch { toast.error("Failed to mark complete"); }
                        }}
                        className={`text-sm font-heading font-bold px-4 py-2 rounded-xl transition-all ${activeLesson.completed ? "bg-accent/10 text-accent cursor-default" : "bg-accent text-white hover:bg-green-600"}`}
                      >
                        {activeLesson.completed ? "✓ Completed" : "Mark Complete"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Instructor */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-heading font-bold text-primary mb-4">Your Instructor</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-white font-heading font-black text-xl">
                    {course.instructor_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-heading font-bold text-primary text-sm">{course.instructor_name}</p>
                    <p className="text-slate-500 text-xs">Course Instructor</p>
                  </div>
                </div>
                {course.instructor_bio && (
                  <p className="text-slate-500 text-xs leading-relaxed">{course.instructor_bio}</p>
                )}
              </div>

              {course.requirements?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-heading font-bold text-primary mb-4">Requirements</h3>
                  <ul className="space-y-2">
                    {course.requirements.map((req: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="text-slate-400 mt-0.5">•</span> {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
