import { Image as ImageIcon, ScanLine } from "lucide-react";

const stats = [
  ["Fruit on Tree", "0"], ["Fruit on Ground", "0"], ["Total Detected", "0"],
  ["Inference Time", "–"], ["Model", "–"],
];

export function ResultsPanel({ imageUrl }: { imageUrl: string | null }) {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-ink/10 p-5 sm:p-7">
        <p className="eyebrow">Output 03</p>
        <div className="flex items-center justify-between gap-4">
          <h2 className="section-title">Detection Result</h2>
          <span className="rounded-full bg-ink/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink/45">Awaiting model</span>
        </div>
      </div>
      <div className="grid gap-px bg-ink/10 sm:grid-cols-2">
        <ImageFrame title="Original Image" imageUrl={imageUrl} />
        <ImageFrame title="Detection Result" imageUrl={null} result />
      </div>
      <div className="p-5 sm:p-7">
        <h3 className="mb-4 text-sm font-bold">Estimated Fruit Count</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map(([label, value], index) => (
            <div key={label} className={`rounded-xl border border-ink/10 bg-canvas/60 p-4 ${index > 2 ? "sm:col-span-1" : ""}`}>
              <span className="block text-xs text-ink/50">{label}</span>
              <strong className={`mt-2 block font-mono text-2xl ${index === 2 ? "text-citrus" : "text-ink"}`}>{value}</strong>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-ink/45">Placeholder values only. No inference has been performed.</p>
      </div>
    </div>
  );
}

function ImageFrame({ title, imageUrl, result = false }: { title: string; imageUrl: string | null; result?: boolean }) {
  return (
    <div className="bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold text-ink/60"><ImageIcon size={14} /> {title}</div>
      <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-lg border border-ink/10 bg-[#eef0ea]">
        {imageUrl ? <img src={imageUrl} alt="Original citrus upload" className="h-full w-full object-contain" /> : (
          <div className="px-4 text-center text-ink/35">
            <ScanLine className="mx-auto mb-3" size={30} strokeWidth={1.5} />
            <p className="text-xs font-medium">{result ? "Results will appear here" : "No image selected"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

