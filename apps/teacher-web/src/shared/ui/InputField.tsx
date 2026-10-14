import type { ComponentPropsWithoutRef } from "react";

export function InputField({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return <input {...props} className={`input ${className}`} />;
}

export function TextAreaField({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return <textarea {...props} className={`input ${className}`} />;
}
