"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Video, ChevronDown, ChevronUp, ArrowLeft, Save } from "lucide-react";

export default function ManageCoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loadUser } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [exam, setExam] = useState<any>(null);
const [examQuestions, setExamQuestions] = useState<any[]>([]);
const [newQuestion, setNewQuestion] = useState({ question: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "a" });
  const [newLesson, setNewLesson] = useState({ title: "", video_url: "", duration: 0, is_preview: false });
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);

  useEffect(() => { loadUser(); fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const { data } = await api.get(`/courses/${id}/modules`);
      setModules(data.modules || []);
      const { data: cd } = await api.get(`/courses/${id}`);
      setCourse(cd.course);
      const { data: examData } = await api.get(`/exams/course/${id}`);
      if (examData.exam) {
        setExam(examData.exam);
        const { data: qData } = await api.get(`/exams/exam/${examData.exam.id}/questions`);
        setExamQuestions(qData.questions || []);
      }
    } catch { toast.error("Failed to load course"); }
    finally { setLoading(false); }
  };

const createExam = async () => {
    try {
      const { data } = await api.post(`/exams/course/${id}/create`, { title: "Final Exam" });
      setExam(data.exam);
      toast.success("Exam created!");
    } catch { toast.error("Failed to create exam"); }
  };

  const addQuestion = async () => {
    if (!newQuestion.question || !newQuestion.option_a || !newQuestion.option_b || !newQuestion.option_c || !newQuestion.option_d) {
      toast.error("Fill in all fields!"); return;
    }
    try {
      const { data } = await api.post(`/exams/exam/${exam.id}/question`, { ...newQuestion, order_index: examQuestions.length });
      setExamQuestions([...examQuestions, data.question]);
      setNewQuestion({ question: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "a" });
      toast.success("Question added!");
    } catch { toast.error("Failed to add question"); }
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      await api.delete(`/exams/question/${questionId}`);
      setExamQuestions(examQuestions.filter((q: any) => q.id !== questionId));
      toast.success("Question deleted!");
    } catch { toast.error("Failed to delete question"); }
  };  
const addModule = async () => {
    if (!newModuleTitle.trim()) { toast.error("Enter module title"); return; }
    try {
      await api.post(`/courses/${id}/modules`, { title: newModuleTitle, order_index: modules.length });
      toast.success("Module added!");
      setNewModuleTitle("");
      setAddingModule(false);
      fetchData();
    } catch { toast.error("Failed to add module"); }
  };

  const addLesson = async (moduleId: string) => {
    if (!newLesson.title.trim()) { toast.error("Enter lesson title"); return; }
    if (!newLesson.video_url.trim()) { toast.error("Enter YouTube video ID"); return; }
    try {
      const mod = modules.find(m => m.id === moduleId);
      await api.post(`/courses/modules/${moduleId}/lessons`, {
        ...newLesson,
        order_index: mod?.lessons?.length || 0,
      });
      toast.success("Lesson added!");
      setNewLesson({ title: "", video_url: "", duration: 0, is_preview: false });
      setAddingLessonTo(null);
      fetchData();
    } catch { toast.error("Failed to add lesson"); }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-10 h-10 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-slate-50">
        <div className="bg-primary py-8 px-8">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => router.push("/instructor")} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <h1 className="text-2xl font-heading font-black text-white">{course?.title}</h1>
            <p className="text-slate-400 text-sm mt-1">Manage modules and lessons</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="space-y-4 mb-6">
            {modules.map((mod, mi) => (
              <div key={mod.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <button onClick={() => setActiveModule(activeModule === mod.id ? null : mod.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center font-heading font-bold text-sm">{mi + 1}</span>
                    <span className="font-heading font-semibold text-primary">{mod.title}</span>
                    <span className="text-slate-400 text-xs">{mod.lessons?.length || 0} lessons</span>
                  </div>
                  {activeModule === mod.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {activeModule === mod.id && (
                  <div className="border-t border-slate-100">
                    {mod.lessons?.map((lesson: any) => (
                      <div key={lesson.id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-50">
                        <Video className="w-4 h-4 text-secondary shrink-0" />
                        <span className="text-sm text-slate-600 flex-1">{lesson.title}</span>
                        {lesson.is_preview && <span className="text-xs text-accent font-heading font-semibold bg-accent/10 px-2 py-0.5 rounded-full">Preview</span>}
                      </div>
                    ))}

                    {addingLessonTo === mod.id ? (
                      <div className="p-5 bg-slate-50 space-y-3">
                        <p className="font-heading font-semibold text-primary text-sm">Add New Lesson</p>
                        <input value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })}
                          placeholder="Lesson title" className="input text-sm w-full" />
                        <div>
                          <input value={newLesson.video_url} onChange={e => setNewLesson({ ...newLesson, video_url: e.target.value })}
                            placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)" className="input text-sm w-full" />
                          <p className="text-xs text-slate-400 mt-1">Copy the ID from youtube.com/watch?v=<strong>THIS_PART</strong></p>
                        </div>
                        <input type="number" value={newLesson.duration} onChange={e => setNewLesson({ ...newLesson, duration: parseInt(e.target.value) })}
                          placeholder="Duration in seconds (e.g. 300 = 5 min)" className="input text-sm w-full" />
                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                          <input type="checkbox" checked={newLesson.is_preview} onChange={e => setNewLesson({ ...newLesson, is_preview: e.target.checked })} />
                          Free preview (visible without enrollment)
                        </label>
                        <div className="flex gap-2">
                          <button onClick={() => addLesson(mod.id)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                            <Save className="w-4 h-4" /> Save Lesson
                          </button>
                          <button onClick={() => setAddingLessonTo(null)} className="text-sm text-slate-400 hover:text-slate-600 px-4">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setAddingLessonTo(mod.id)}
                        className="w-full flex items-center gap-2 px-5 py-3 text-secondary text-sm font-heading font-semibold hover:bg-slate-50 transition-colors">
                        <Plus className="w-4 h-4" /> Add Lesson
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {addingModule ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <p className="font-heading font-semibold text-primary">New Module</p>
              <input value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)}
                placeholder="e.g. Introduction to Networking" className="input w-full" />
              <div className="flex gap-2">
                <button onClick={addModule} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Module
                </button>
                <button onClick={() => setAddingModule(false)} className="text-sm text-slate-400 hover:text-slate-600 px-4">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingModule(true)}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:border-secondary hover:text-secondary transition-all font-heading font-semibold text-sm">
              <Plus className="w-5 h-5" /> Add New Module
            </button>
          )}
        </div>
      </div>

      {/* Exam Builder */}
      <div className="mt-8">
        <h2 className="font-heading font-bold text-primary text-xl mb-4">Final Exam</h2>
        {!exam ? (
          <button onClick={createExam} className="btn-primary">Create Exam</button>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="font-heading font-semibold text-primary mb-1">Exam created ✅</p>
              <p className="text-slate-400 text-sm">{examQuestions.length} / 20 questions added · Pass mark: 70%</p>
            </div>
            {examQuestions.map((q: any, i: number) => (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex justify-between items-start">
                  <p className="font-heading font-semibold text-primary text-sm"><span className="text-secondary mr-2">Q{i+1}.</span>{q.question}</p>
                  <button onClick={() => deleteQuestion(q.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {["a","b","c","d"].map(opt => (
                    <p key={opt} className={`text-xs px-3 py-2 rounded-lg ${q.correct_answer === opt ? "bg-accent/10 text-accent font-bold" : "bg-slate-50 text-slate-500"}`}>
                      <span className="uppercase font-bold mr-1">{opt}.</span>{q[`option_${opt}`]}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {examQuestions.length < 20 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <p className="font-heading font-semibold text-primary">Add Question {examQuestions.length + 1}</p>
                <textarea value={newQuestion.question} onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
                  placeholder="Question text..." className="input w-full resize-none" rows={2}/>
                <div className="grid grid-cols-2 gap-3">
                  {["a","b","c","d"].map(opt => (
                    <input key={opt} value={newQuestion[`option_${opt}`]} onChange={e => setNewQuestion({...newQuestion, [`option_${opt}`]: e.target.value})}
                      placeholder={`Option ${opt.toUpperCase()}`} className="input text-sm"/>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-2">Correct Answer:</p>
                  <div className="flex gap-2">
                    {["a","b","c","d"].map(opt => (
                      <button key={opt} onClick={() => setNewQuestion({...newQuestion, correct_answer: opt})}
                        className={`px-4 py-2 rounded-xl text-sm font-heading font-bold border transition-all ${newQuestion.correct_answer === opt ? "bg-accent text-white border-accent" : "border-slate-200 text-slate-500"}`}>
                        {opt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={addQuestion} className="btn-primary text-sm py-2 px-5">Add Question</button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
