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
  const [newLesson, setNewLesson] = useState({ title: "", video_url: "", duration: 0, is_preview: false });
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);

  useEffect(() => { loadUser(); fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const { data } = await api.get(`/courses/${id}/modules`);
      setModules(data.modules || []);
      const { data: cd } = await api.get(`/courses/${id}`);
      setCourse(cd.course);
    } catch { toast.error("Failed to load course"); }
    finally { setLoading(false); }
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
    </>
  );
}
