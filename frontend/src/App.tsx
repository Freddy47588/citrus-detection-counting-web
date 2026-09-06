import { useState } from "react";
import { Activity, CircleDot, GitCompareArrows, ScanLine } from "lucide-react";
import { ImageUpload } from "./components/ImageUpload";
import { ModelSelector, type ModelOption } from "./components/ModelSelector";
import { ResultsPanel } from "./components/ResultsPanel";

const metrics = ["Precision", "Recall", "F1-score", "mAP@50", "mAP@50:95", "MAE", "RMSE"];

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [model, setModel] = useState<ModelOption>("yolo11s");
  const [confidence, setConfidence] = useState(0.25);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-ink/10 bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="#" className="flex items-center gap-3" aria-label="CitDet home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white shadow-sm">
              <ScanLine size={21} aria-hidden="true" />
            </span>
            <span className="text-xl font-bold tracking-tight">CitDet</span>
          </a>
          <div className="flex items-center gap-2 rounded-full border border-leaf/20 bg-white px-3 py-1.5 text-xs font-semibold text-leaf">
            <span className="h-2 w-2 rounded-full bg-citrus" />
            Local MVP · v0.1
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-ink/10">
          <div className="hero-grid absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-leaf">
                <Activity size={15} aria-hidden="true" /> Computer Vision Research
              </div>
              <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl">
                Citrus Detection <span className="text-citrus">&amp;</span> Counting
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/65">
                YOLO11s × D-FINE-S Detection Prototype
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-6">
              <div className="panel p-5 sm:p-7">
                <div className="mb-5">
                  <p className="eyebrow">Input 01</p>
                  <h2 className="section-title">Upload Citrus Image</h2>
                  <p className="section-copy">Add a field image to prepare the detection workspace.</p>
                </div>
                <ImageUpload imageUrl={imageUrl} onImageChange={setImageUrl} />
              </div>

              <div className="panel p-5 sm:p-7">
                <div className="mb-5">
                  <p className="eyebrow">Configuration 02</p>
                  <h2 className="section-title">Detection Settings</h2>
                </div>
                <ModelSelector value={model} onChange={setModel} />
                <div className="mt-7 border-t border-ink/10 pt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <label htmlFor="confidence" className="text-sm font-semibold">Confidence Threshold</label>
                    <output htmlFor="confidence" className="rounded-md bg-orange-50 px-2.5 py-1 font-mono text-sm font-bold text-citrus">
                      {confidence.toFixed(2)}
                    </output>
                  </div>
                  <input
                    id="confidence"
                    type="range"
                    min="0.05"
                    max="0.9"
                    step="0.05"
                    value={confidence}
                    onChange={(event) => setConfidence(Number(event.target.value))}
                    className="slider w-full"
                    style={{ background: `linear-gradient(to right, #ed7a16 0%, #ed7a16 ${((confidence - 0.05) / 0.85) * 100}%, #e6e5df ${((confidence - 0.05) / 0.85) * 100}%, #e6e5df 100%)` }}
                  />
                  <div className="mt-2 flex justify-between text-xs text-ink/45"><span>0.05</span><span>0.90</span></div>
                </div>
                <button type="button" disabled className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-ink/10 px-4 py-3.5 text-sm font-bold text-ink/45">
                  <CircleDot size={17} aria-hidden="true" /> Inference unavailable in MVP
                </button>
              </div>
            </div>

            <ResultsPanel imageUrl={imageUrl} />
          </div>
        </section>

        <section className="border-y border-ink/10 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="eyebrow">Research Demo</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">A focused inference visualizer</h2>
            </div>
            <div>
              <p className="leading-7 text-ink/65">
                CitDet is a prototype interface for visualizing object-detection inference on citrus imagery. Official research evaluation is performed in a separate, controlled pipeline; this website does not calculate or alter those results.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {metrics.map((metric) => <span key={metric} className="rounded-full border border-ink/10 bg-canvas px-3 py-1.5 font-mono text-xs text-ink/65">{metric}</span>)}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-ink/50 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>CitDet · Citrus Detection &amp; Counting</span>
        <span className="flex items-center gap-2"><GitCompareArrows size={14} /> YOLO11s × D-FINE-S research prototype</span>
      </footer>
    </div>
  );
}

export default App;
