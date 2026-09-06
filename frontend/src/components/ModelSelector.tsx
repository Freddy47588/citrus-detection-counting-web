import { GitCompareArrows, ScanSearch } from "lucide-react";

export type ModelOption = "yolo11s" | "dfine-s" | "compare";

interface ModelSelectorProps { value: ModelOption; onChange: (value: ModelOption) => void; }

const models: Array<{ id: ModelOption; name: string; detail: string }> = [
  { id: "yolo11s", name: "YOLO11s", detail: "Single model" },
  { id: "dfine-s", name: "D-FINE-S", detail: "Single model" },
  { id: "compare", name: "Compare Models", detail: "Side by side" },
];

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold">Model</legend>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {models.map((model) => (
          <label key={model.id} className={`cursor-pointer rounded-xl border p-3 transition ${value === model.id ? "border-citrus bg-orange-50 ring-1 ring-citrus/20" : "border-ink/10 bg-white hover:border-ink/25"}`}>
            <input type="radio" name="model" value={model.id} checked={value === model.id} onChange={() => onChange(model.id)} className="sr-only" />
            <span className="mb-3 flex items-start justify-between">
              {model.id === "compare" ? <GitCompareArrows size={18} /> : <ScanSearch size={18} />}
              <span className={`h-2.5 w-2.5 rounded-full border ${value === model.id ? "border-citrus bg-citrus" : "border-ink/25"}`} />
            </span>
            <span className="block text-sm font-bold">{model.name}</span>
            <span className="mt-0.5 block text-[11px] text-ink/45">{model.detail} · inactive</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

