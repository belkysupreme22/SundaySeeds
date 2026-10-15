export interface StudioEntry {
  mode: "course" | "new-course" | "edit" | "preview" | "publish";
  courseId?: string;
  lessonId?: string;
  moduleId?: string;
}
