import { ArrowRight, BookOpen, Layers, Library } from "lucide-react";

type CourseFlowGuideProps = {
  hasCourse: boolean;
  hasModules: boolean;
  hasLessons: boolean;
  onTryExample: () => void;
};

const steps = [
  {
    title: "Course",
    description: "The overall learning journey and its purpose.",
    example: "Faith in Everyday Life",
    Icon: Library,
  },
  {
    title: "Modules",
    description: "Themes that group related lessons in order.",
    example: "Loving Others",
    Icon: Layers,
  },
  {
    title: "Lessons",
    description: "Reading and reflection. Quick knowledge checks are planned.",
    example: "Good Samaritan",
    Icon: BookOpen,
  },
];

export function CourseFlowGuide({
  hasCourse,
  hasModules,
  hasLessons,
  onTryExample,
}: CourseFlowGuideProps) {
  const currentStep = !hasCourse ? 0 : !hasModules ? 1 : !hasLessons ? 2 : -1;

  return (
    <section className="course-flow" aria-label="How to organize a course">
      <div className="course-toolbar">
        <div>
          <h3>Build your course in three steps</h3>
          <p className="muted">
            Create a course, group it into modules, then add your lessons.
          </p>
        </div>
        <span className="badge tone-yellow">Example data</span>
      </div>
      <ol className="course-flow-steps">
        {steps.map(({ title, description, example, Icon }, index) => {
          const isCurrent = currentStep === index;
          const isOutlined = currentStep === -1 || index < currentStep;

          return (
            <li
              key={title}
              className="course-flow-step"
              data-current={isCurrent || undefined}
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="course-flow-step-heading">
                <span className="course-flow-icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h4>
                  {index + 1}. {title}
                </h4>
                <span className="course-flow-state">
                  {isCurrent ? "Next step" : isOutlined ? "Outlined" : "To add"}
                </span>
              </div>
              <p>{description}</p>
              <p className="course-flow-example">
                <ArrowRight size={15} aria-hidden="true" />
                {example}
              </p>
            </li>
          );
        })}
      </ol>
      <div className="course-flow-footer">
        <p className="muted">
          {currentStep === -1
            ? "Your outline is taking shape. The course remains a draft."
            : "Try a filled-in outline to see how the pieces fit together."}
        </p>
        <button
          type="button"
          className="button button-outline"
          onClick={onTryExample}
        >
          Try an example course
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
