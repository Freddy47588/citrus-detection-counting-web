import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { FileImage, ImagePlus, RotateCcw } from "lucide-react";

const acceptedTypes = ["image/jpeg", "image/png"];
const maxFileSize = 15 * 1024 * 1024;

interface ImageUploadProps {
  imageUrl: string | null;
  disabled?: boolean;
  onImageChange: (file: File, url: string) => void;
}

export function ImageUpload({ imageUrl, disabled = false, onImageChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);

  function selectFile(file?: File) {
    setError(null);
    if (!file) return;
    if (!acceptedTypes.includes(file.type)) {
      setError("Choose a JPG, JPEG, or PNG image.");
      return;
    }
    if (file.size > maxFileSize) {
      setError("Image must be 15 MB or smaller.");
      return;
    }
    onImageChange(file, URL.createObjectURL(file));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) selectFile(event.dataTransfer.files[0]);
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={handleInput} disabled={disabled} className="sr-only" />
      {imageUrl ? (
        <div className="group relative overflow-hidden rounded-xl border border-ink/10 bg-ink">
          <img src={imageUrl} alt="Selected citrus preview" className="aspect-[16/10] w-full object-contain" />
          <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()} className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-bold text-ink shadow-lg transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
            <RotateCcw size={14} /> Replace
          </button>
        </div>
      ) : (
        <div
          onDragEnter={(event) => { event.preventDefault(); if (!disabled) setIsDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed px-5 py-12 text-center transition ${isDragging ? "border-citrus bg-orange-50" : "border-ink/15 bg-canvas/60 hover:border-citrus/60"}`}
        >
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-orange-100 text-citrus"><ImagePlus size={23} /></span>
          <p className="mt-4 text-sm font-semibold">Drag and drop an image here</p>
          <p className="mt-1 text-xs text-ink/60">JPG, JPEG, or PNG · max 15 MB</p>
          <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition hover:border-citrus/50 hover:text-citrus disabled:cursor-not-allowed disabled:opacity-60">
            <FileImage size={16} /> Browse file
          </button>
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{error}</p>}
    </div>
  );
}
