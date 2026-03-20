"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Clock, Award } from "lucide-react";

export default function ExamPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, loadUser } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUser().then(() => {
      const u = useAuthStore.getState().user;
      if (!u) { router.push("/auth/login"); return; }
      fetchData();
    });
  }, [slug]);

  const fetchData = async () => {
    try {
      const { data: courseData } = await api.get(`/courses/${slug}`);
      setCourse(courseData.course);
      const { data: examData } = await api.get(`/exams/course/${courseData.course.id}`);
      setExam(examData.exam);
      setQuestions(examData.questions || []);
      const { data: resultData } = await api.get(`/exams/result/${courseData.course.id}`);
      if (resultData.result) { setResult(resultData.result); setSubmitted(true); }
    } catch { toast.error("Failed to load exam"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error("Please answer all questions before submitting!");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/exams/submit/${course.id}`, { answers });
      setResult(data);
      setSubmitted(true);
      if (data.passed) toast.success("Congratulations! You passed! 🎉");
      else toast.error("You didn't pass this time. Review and try again!");
    } catch { toast.error("Failed to submit exam"); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-slate-400 text-sm mb-1">{course?.title}</p>
          <h1 className="font-heading font-black text-primary text-3xl">Final Exam</h1>
          <p className="text-slate-500 text-sm mt-2">20 questions · Pass mark: 70% · One attempt</p>
        </div>

        {submitted && result ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            {result.passed ? (
              <>
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10 text-accent" />
                </div>
                <h2 className="font-heading font-black text-primary text-3xl mb-2">You Passed! 🎉</h2>
                <p className="text-slate-500 mb-4">Your score: <span className="font-heading font-bold text-accent text-2xl">{result.score}%</span></p>
                <p className="text-slate-400 text-sm mb-8">Your certificate has been unlocked! Go to your dashboard to download it.</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => router.push("/dashboard")} className="btn-primary">Go to Dashboard</button>
                  <button onClick={() => router.push(`/courses/${slug}`)} className="btn-outline">Back to Course</button>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="font-heading font-black text-primary text-3xl mb-2">Not Passed</h2>
                <p className="text-slate-500 mb-4">Your score: <span className="font-heading font-bold text-red-500 text-2xl">{result.score}%</span></p>
                <p className="text-slate-400 text-sm mb-8">You need 70% to pass. Review the course material and try again.</p>
                <button onClick={() => router.push(`/courses/${slug}`)} className="btn-primary">Back to Course</button>
              </>
            )}
          </div>
        ) : (
          <>
            {!exam || questions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h2 className="font-heading font-bold text-primary text-xl mb-2">Exam Coming Soon</h2>
                <p className="text-slate-400 text-sm">The instructor hasn't added exam questions yet. Check back later!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q, i) => (
                  <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-6">
                    <p className="font-heading font-bold text-primary mb-4">
                      <span className="text-secondary mr-2">Q{i + 1}.</span>{q.question}
                    </p>
                    <div className="space-y-3">
                      {["a","b","c","d"].map(opt => (
                        <button key={opt} onClick={() => setAnswers({...answers, [q.id]: opt})}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-heading transition-all ${
                            answers[q.id] === opt
                              ? "border-secondary bg-secondary/5 text-secondary font-semibold"
                              : "border-slate-200 hover:border-slate-300 text-slate-600"
                          }`}>
                          <span className="font-bold uppercase mr-3">{opt}.</span>
                          {q[`option_${opt}`]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between">
                  <p className="text-slate-500 text-sm">{Object.keys(answers).length} of {questions.length} answered</p>
                  <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                    {submitting ? "Submitting..." : "Submit Exam"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
