import Link from "next/link";
import Image from "next/image";
import { Star, Users, Clock } from "lucide-react";

const PHOTOS: Record<string, string> = {
  "Cybersecurity": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop",
  "Web Development": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop",
  "AI": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&auto=format&fit=crop",
  "Data Analysis": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop",
  "Cloud Computing": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop",
  "DevOps": "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&auto=format&fit=crop",
};

const LEVEL_COLOR: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

interface Course {
  id: string; title: string; slug: string;
  short_description?: string; description?: string;
  thumbnail_url?: string; category: string; level: string;
  price: number; original_price?: number;
  instructor_name: string; enrollment_count: number;
  avg_rating: number; review_count: number;
  is_locked?: boolean; next_intake?: string;
}

export default function CourseCard({ course }: { course: Course }) {
  const photo = course.thumbnail_url || PHOTOS[course.category] || PHOTOS["Web Development"];
  const rating = parseFloat(String(course.avg_rating || 0)).toFixed(1);
  const students = parseInt(String(course.enrollment_count || 0));

  return (
    <Link href={`/courses/${course.slug}`} className="card group flex flex-col">
      <div className="relative h-44 overflow-hidden bg-slate-100">
      {course.is_locked && (
          <div className="absolute inset-0 z-10 bg-primary/80 backdrop-blur-sm flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="font-heading font-black text-white text-sm">Enrollment Closed</p>
            {course.next_intake && <p className="text-white/70 text-xs mt-1">Next Intake: {course.next_intake}</p>}
          </div>
        )}
        <Image src={photo} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className={`absolute top-3 left-3 tag ${LEVEL_COLOR[course.level] || "bg-slate-100 text-slate-700"}`}>
          {course.level}
        </span>
        <span className="absolute top-3 right-3 tag bg-primary/80 text-white backdrop-blur-sm">
          {course.category}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading font-semibold text-primary text-[15px] leading-snug mb-1.5 line-clamp-2 group-hover:text-secondary transition-colors">
          {course.title}
        </h3>
        <p className="text-slate-500 text-xs mb-2 line-clamp-2 flex-1">
          {course.short_description || course.description?.slice(0, 90) + "..."}
        </p>
        <p className="text-slate-500 text-xs mb-3">
          by <span className="font-medium text-slate-700">{course.instructor_name}</span>
        </p>

        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-700">{rating}</span>
            <span>({course.review_count})</span>
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {students.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-primary text-lg">
              KSh {parseInt(String(course.price)).toLocaleString()}
            </span>
            {course.original_price && (
              <span className="text-slate-400 text-xs line-through">
                KSh {parseInt(String(course.original_price)).toLocaleString()}
              </span>
            )}
          </div>
          <span className="text-secondary text-xs font-heading font-semibold">Enroll →</span>
        </div>
      </div>
    </Link>
  );
}
