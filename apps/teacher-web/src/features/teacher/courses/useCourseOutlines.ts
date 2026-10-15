import { useRef, useState } from "react";
import { createExampleCourse } from "./exampleCourse";

export interface CourseModule {
  id: string;
  title: string;
  lessonIds: string[];
}

export interface CourseOutline {
  id: string;
  example?: boolean;
  title: string;
  summary: string;
  audience?: string;
  outcomes?: string[];
  modules: CourseModule[];
}

export type CourseDetails = Pick<
  CourseOutline,
  "title" | "summary" | "audience" | "outcomes"
>;
export type MoveDirection = -1 | 1;

function move<T>(items: T[], index: number, direction: MoveDirection): T[] {
  const destination = index + direction;
  if (index < 0 || destination < 0 || destination >= items.length) return items;
  const reordered = [...items];
  const [item] = reordered.splice(index, 1);
  reordered.splice(destination, 0, item);
  return reordered;
}

export function useCourseOutlines() {
  const [courses, setCourses] = useState<CourseOutline[]>([]);
  const [selectedId, selectCourse] = useState<string | null>(null);
  const nextId = useRef(1);

  function updateCourse(
    id: string,
    change: (course: CourseOutline) => CourseOutline,
  ) {
    setCourses((current) =>
      current.map((course) => (course.id === id ? change(course) : course)),
    );
  }

  function updateModule(
    courseId: string,
    moduleId: string,
    change: (module: CourseModule) => CourseModule,
  ) {
    updateCourse(courseId, (course) => ({
      ...course,
      modules: course.modules.map((module) =>
        module.id === moduleId ? change(module) : module,
      ),
    }));
  }

  function createCourse(details: CourseDetails): string | null {
    if (!details.title.trim()) return null;
    const courseId = `course-${nextId.current++}`;
    setCourses((current) => [
      ...current,
      {
        id: courseId,
        title: details.title.trim(),
        summary: details.summary.trim(),
        audience: details.audience?.trim(),
        outcomes: details.outcomes?.map((item) => item.trim()).filter(Boolean),
        modules: [],
      },
    ]);
    selectCourse(courseId);
    return courseId;
  }

  function saveCourse(details: CourseDetails, id?: string): boolean {
    if (!details.title.trim()) return false;
    const content = {
      title: details.title.trim(),
      summary: details.summary.trim(),
      audience: details.audience?.trim(),
      outcomes: details.outcomes
        ?.map((outcome) => outcome.trim())
        .filter(Boolean),
    };
    if (id) updateCourse(id, (course) => ({ ...course, ...content }));
    else return Boolean(createCourse(details));
    return true;
  }

  function addModule(courseId: string, title: string): boolean {
    if (!title.trim()) return false;
    const module = {
      id: `module-${nextId.current++}`,
      title: title.trim(),
      lessonIds: [],
    };
    updateCourse(courseId, (course) => ({
      ...course,
      modules: [...course.modules, module],
    }));
    return true;
  }

  function renameModule(
    courseId: string,
    moduleId: string,
    title: string,
  ): boolean {
    if (!title.trim()) return false;
    updateModule(courseId, moduleId, (module) => ({
      ...module,
      title: title.trim(),
    }));
    return true;
  }

  function attachLesson(courseId: string, moduleId: string, lessonId: string) {
    if (!lessonId) return;
    updateCourse(courseId, (course) => {
      if (course.modules.some((module) => module.lessonIds.includes(lessonId)))
        return course;
      return {
        ...course,
        modules: course.modules.map((module) =>
          module.id === moduleId
            ? { ...module, lessonIds: [...module.lessonIds, lessonId] }
            : module,
        ),
      };
    });
  }

  return {
    courses,
    selectedId,
    selectCourse,
    saveCourse,
    createCourse,
    addModule,
    renameModule,
    attachLesson,
    openExample() {
      const example = createExampleCourse();
      setCourses((current) =>
        current.some((course) => course.id === example.id)
          ? current
          : [...current, example],
      );
      selectCourse(example.id);
    },
    removeCourse(id: string) {
      setCourses((current) => current.filter((course) => course.id !== id));
      selectCourse((current) => (current === id ? null : current));
    },
    removeModule(courseId: string, moduleId: string) {
      updateCourse(courseId, (course) => ({
        ...course,
        modules: course.modules.filter((module) => module.id !== moduleId),
      }));
    },
    moveModule(courseId: string, moduleId: string, direction: MoveDirection) {
      updateCourse(courseId, (course) => ({
        ...course,
        modules: move(
          course.modules,
          course.modules.findIndex((module) => module.id === moduleId),
          direction,
        ),
      }));
    },
    removeLesson(courseId: string, moduleId: string, lessonId: string) {
      updateModule(courseId, moduleId, (module) => ({
        ...module,
        lessonIds: module.lessonIds.filter((id) => id !== lessonId),
      }));
    },
    moveLesson(
      courseId: string,
      moduleId: string,
      lessonId: string,
      direction: MoveDirection,
    ) {
      updateModule(courseId, moduleId, (module) => ({
        ...module,
        lessonIds: move(
          module.lessonIds,
          module.lessonIds.indexOf(lessonId),
          direction,
        ),
      }));
    },
  };
}

export type CourseOutlineModel = ReturnType<typeof useCourseOutlines>;
