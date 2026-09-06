import { Image as ImageIcon, LoaderCircle, ScanLine } from "lucide-react";
import type { ReactNode } from "react";
import type { DetectionResponse, RequestState } from "../types/detection";
import { DetectionViewer } from "./DetectionViewer";

interface ResultsPanelProps {
  imageUrl: string | null;
  result: DetectionResponse | null;
  requestState: RequestState;
}

export function ResultsPanel({ imageUrl, result, requestState }: ResultsPanelProps) {
  const stats = [
    ["Fruit on Tree", result?.counts.fruit_on_tree ?? "0"],
    ["Fruit on Ground", result?.counts.fruit_on_ground ?? "0"],
    ["Total Detected", result?.counts.total ?? "0"],
    ["Inference Time", result ? `${result.inference_time_ms.toFixed(2)} ms` : "–"],
    ["Model", result?.model ?? "–"],
    ["Confidence", result ? result.confidence_threshold.toFixed(2) : "–"],
  ];
  const statusLabel = requestState === "loading" ? "Processing" : result ? "Complete" : "Awaiting detection";

  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-ink/10 p-5 sm:p-7">
        <p className="eyebrow">Output 03</p>
        <div className="flex items-center justify-between gap-4">
          <h2 className="section-title">Detection Result</h2>
          <span className="rounded-full bg-ink/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink/45">{statusLabel}</span>
        </div>
      </div>
      <div className="grid gap-px bg-ink/10 sm:grid-cols-2">
        <ImageFrame title="Original Image" imageUrl={imageUrl} />
        <div className="bg-white p-4">
          <FrameTitle title="Detection Result" />
          {requestState === "loading" ? (
            <Placeholder icon={<LoaderCircle className="animate-spin" size={30} />} text="Running YOLO11s inference…" />
          ) : result && imageUrl ? (
            <DetectionViewer imageUrl={imageUrl} width={result.image_width} height={result.image_height} detections={result.detections} />
          ) : (
            <Placeholder text="Results will appear here" />
          )}
        </div>
      </div>
      <div className="p-5 sm:p-7">
        <h3 className="mb-4 text-sm font-bold">Estimated Fruit Count</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map(([label, value], index) => (
            <div key={label} className="rounded-xl border border-ink/10 bg-canvas/60 p-4">
              <span className="block text-xs text-ink/50">{label}</span>
              <strong className={`mt-2 block font-mono text-xl sm:text-2xl ${index === 2 ? "text-citrus" : "text-ink"}`}>{value}</strong>
            </div>
          ))}
        </div>
        {result?.detections.length === 0 && (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">No citrus fruit detected above the selected confidence threshold.</p>
        )}
      </div>
    </div>
  );
}

function FrameTitle({ title }: { title: string }) {
  return <div className="mb-3 flex items-center gap-2 text-xs font-bold text-ink/60"><ImageIcon size={14} /> {title}</div>;
}

function Placeholder({ text, icon }: { text: string; icon?: ReactNode }) {
  return (
    <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-lg border border-ink/10 bg-[#eef0ea]">
      <div className="px-4 text-center text-ink/35">
        {icon ?? <ScanLine className="mx-auto mb-3" size={30} strokeWidth={1.5} />}
        <p className="mt-3 text-xs font-medium">{text}</p>
      </div>
    </div>
  );
}

function ImageFrame({ title, imageUrl }: { title: string; imageUrl: string | null }) {
  return (
    <div className="bg-white p-4">
      <FrameTitle title={title} />
      {imageUrl ? (
        <div className="overflow-hidden rounded-lg bg-[#eef0ea]"><img src={imageUrl} alt="Original citrus upload" className="block h-auto w-full" /></div>
      ) : (
        <Placeholder text="No image selected" />
      )}
    </div>
  );
}
