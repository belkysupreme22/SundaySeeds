import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { InputField } from "../../../shared/ui/InputField";
import type { LessonImage } from "./types";

interface LessonImageFieldProps {
  image?: LessonImage;
  onChange: (image: LessonImage | undefined) => void;
  onBusyChange: (busy: boolean) => void;
}

export function LessonImageField({
  image,
  onChange,
  onBusyChange,
}: LessonImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<FileReader | null>(null);
  const requestRef = useRef(0);
  const callbacksRef = useRef({ onChange, onBusyChange });
  callbacksRef.current = { onChange, onBusyChange };
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    () => () => {
      requestRef.current += 1;
      readerRef.current?.abort();
      callbacksRef.current.onBusyChange(false);
    },
    [],
  );

  function cancelRead() {
    requestRef.current += 1;
    readerRef.current?.abort();
    readerRef.current = null;
    setBusy(false);
    callbacksRef.current.onBusyChange(false);
  }
  function clear() {
    cancelRead();
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    callbacksRef.current.onChange(undefined);
  }
  function select(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    cancelRead();
    setError("");
    event.target.value = "";
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError(
        "Choose a PNG, JPEG or WebP image. Your current cover has been kept.",
      );
      return;
    }
    if (!file.size || file.size > 5 * 1024 * 1024) {
      setError(
        "Choose a non-empty image no larger than 5 MB. Your current cover has been kept.",
      );
      return;
    }
    const request = requestRef.current;
    const reader = new FileReader();
    readerRef.current = reader;
    setBusy(true);
    callbacksRef.current.onBusyChange(true);
    function fail() {
      if (request !== requestRef.current) return;
      setError(
        "This image could not be opened. Choose another image; your current cover has been kept.",
      );
      setBusy(false);
      callbacksRef.current.onBusyChange(false);
      readerRef.current = null;
    }
    reader.onerror = fail;
    reader.onabort = fail;
    reader.onload = () => {
      if (request !== requestRef.current) return;
      const src = reader.result;
      if (typeof src !== "string") {
        fail();
        return;
      }
      const check = new Image();
      check.onerror = fail;
      check.onload = () => {
        if (request !== requestRef.current) return;
        if (!check.naturalWidth || !check.naturalHeight) {
          fail();
          return;
        }
        callbacksRef.current.onChange({ src, alt: "", name: file.name });
        setBusy(false);
        callbacksRef.current.onBusyChange(false);
        readerRef.current = null;
      };
      check.src = src;
    };
    try {
      reader.readAsDataURL(file);
    } catch {
      fail();
    }
  }

  return (
    <div className="lesson-image-field">
      <label className="field">
        <span>
          <ImagePlus size={17} aria-hidden="true" /> Cover image (optional)
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={select}
        />
        <span className="muted teacher-form-note">
          PNG, JPEG or WebP · Up to 5 MB. Temporary preview only; nothing is
          uploaded.
        </span>
      </label>
      {busy && (
        <p className="muted" role="status">
          Opening image…
        </p>
      )}
      {error && (
        <p className="teacher-form-error" role="alert">
          {error}
        </p>
      )}
      {image && (
        <>
          <img
            className="lesson-image-preview"
            src={image.src}
            alt={image.alt}
          />
          <p
            className="muted teacher-form-note"
            style={{ overflowWrap: "anywhere" }}
          >
            {image.name}
          </p>
          <label className="field">
            Image description (alt text)
            <InputField
              required
              maxLength={250}
              value={image.alt}
              onChange={(event) =>
                onChange({ ...image, alt: event.target.value })
              }
              placeholder="Describe what the image adds to this lesson"
            />
          </label>
        </>
      )}
      {(image || busy) && (
        <button type="button" className="button button-outline" onClick={clear}>
          <X size={17} aria-hidden="true" />
          {image ? "Clear image" : "Cancel image selection"}
        </button>
      )}
    </div>
  );
}
