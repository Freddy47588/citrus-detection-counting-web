import { useEffect, useState } from "react";
import { Activity, CircleDot, GitCompareArrows, LoaderCircle, ScanLine } from "lucide-react";
import { ImageUpload } from "./components/ImageUpload";
import { ModelSelector, type ModelOption } from "./components/ModelSelector";
import { ResultsPanel } from "./components/ResultsPanel";
import { ApiError, detectWithYolo, getModels } from "./services/api";
import type { DetectionResponse, ModelsResponse, RequestState } from "./types/detection";

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [model, setModel] = useState<ModelOption>("yolo11s");
  const [confidence, setConfidence] = useState(0.25);
  const [models, setModels] = useState<ModelsResponse | null>(null);
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getModels()
      .then((payload) => { if (active) setModels(payload); })
      .catch((error: unknown) => {
        if (active) setMessage(error instanceof Error ? error.message : "Could not load model status.");
      });
    return () => { active = false; };
  }, []);

  const yoloAvailable = models?.yolo11s.available ?? false;
  const isLoading = requestState === "loading";
  const canDetect = Boolean(imageFile && model === "yolo11s" && yoloAvailable && !isLoading);

  function handleImageChange(file: File, url: string) {
    setImageFile(file);
    setImageUrl(url);
    setResult(null);
    setRequestState("idle");
    setMessage(null);
  }

  function handleModelChange(value: ModelOption) {
    setModel(value);
    setResult(null);
    setRequestState("idle");
    setMessage(value === "yolo11s" ? null : "D-FINE-S is not available yet.");
  }

  async function handleDetect() {
    if (!imageFile || !canDetect) return;
    setRequestState("loading");
    setResult(null);
    setMessage(null);
    try {
      const detection = await detectWithYolo(imageFile, confidence);
      setResult(detection);
      setRequestState("success");
    } catch (error) {
      setRequestState("error");
      setMessage(error instanceof ApiError ? error.message : "Detection failed unexpectedly. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-ink/10 bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="#" className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-citrus focus-visible:ring-offset-4" aria-label="KalisCitrus home">
            <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-ink text-white shadow-sm"><ScanLine size={21} aria-hidden="true" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-citrus" /></span>
            <span className="text-xl font-bold tracking-tight">KalisCitrus</span>
          </a>
          <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold ${yoloAvailable ? "border-leaf/25 bg-white text-leaf" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
            <span className={`h-2 w-2 rounded-full ${yoloAvailable ? "bg-citrus" : "bg-ink/25"}`} />
            YOLO11s {yoloAvailable ? "ready" : "unavailable"}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-ink/10">
          <div className="hero-grid absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:py-14">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.18em] text-leaf"><Activity size={15} aria-hidden="true" /> Computer Vision Research</div>
              <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl">Citrus Detection <span className="text-citrus">&amp;</span> Counting</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/70 sm:text-lg">YOLO11s × D-FINE-S Research Prototype</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="space-y-6">
              <div className="panel p-5 sm:p-7">
                <div className="mb-5">
                  <p className="eyebrow">Input 01</p>
                  <h2 className="section-title">Upload Citrus Image</h2>
                  <p className="section-copy">Choose a JPEG or PNG field image for detection.</p>
                </div>
                <ImageUpload imageUrl={imageUrl} disabled={isLoading} onImageChange={handleImageChange} />
              </div>

              <div className="panel p-5 sm:p-7">
                <div className="mb-5">
                  <p className="eyebrow">Configuration 02</p>
                  <h2 className="section-title">Detection Settings</h2>
                </div>
                <ModelSelector value={model} yoloAvailable={yoloAvailable} disabled={isLoading} onChange={handleModelChange} />
                <div className="mt-7 border-t border-ink/10 pt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <label htmlFor="confidence" className="text-sm font-semibold">Confidence Threshold</label>
                    <output htmlFor="confidence" className="rounded-md bg-orange-50 px-2.5 py-1 font-mono text-sm font-bold text-citrus">{confidence.toFixed(2)}</output>
                  </div>
                  <input
                    id="confidence"
                    type="range"
                    min="0.05"
                    max="0.9"
                    step="0.05"
                    value={confidence}
                    disabled={isLoading}
                    onChange={(event) => { setConfidence(Number(event.target.value)); setResult(null); setRequestState("idle"); }}
                    className="slider w-full disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: `linear-gradient(to right, #ed7a16 0%, #ed7a16 ${((confidence - 0.05) / 0.85) * 100}%, #e6e5df ${((confidence - 0.05) / 0.85) * 100}%, #e6e5df 100%)` }}
                  />
                  <div className="mt-2 flex justify-between text-xs text-ink/45"><span>0.05</span><span>0.90</span></div>
                </div>

                {message && <p role="alert" className={`mt-5 rounded-lg px-4 py-3 text-sm ${requestState === "error" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-900"}`}>{message}</p>}
                {!message && model === "yolo11s" && models && !yoloAvailable && (
                  <p role="status" className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">YOLO11s is unavailable. Configure the model weight on the backend.</p>
                )}

                <button type="button" disabled={!canDetect} onClick={handleDetect} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3.5 text-sm font-bold text-white transition hover:bg-leaf disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/45">
                  {isLoading ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : <CircleDot size={17} aria-hidden="true" />}
                  {isLoading ? "Detecting citrus…" : "Detect Citrus"}
                </button>
              </div>
            </div>

            <ResultsPanel imageUrl={imageUrl} result={result} requestState={requestState} />
          </div>
        </section>

        <section className="border-y border-ink/10 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div><p className="eyebrow">Research Demo</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">A focused inference visualizer</h2></div>
            <p className="leading-7 text-ink/65">KalisCitrus visualizes object-detection inference on citrus imagery. Official Precision, Recall, F1, mAP, MAE, and RMSE evaluation remains in a separate controlled research pipeline.</p>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-ink/50 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>KalisCitrus — Citrus Detection &amp; Counting</span>
        <span className="flex items-center gap-2"><GitCompareArrows size={14} /> YOLO11s available · D-FINE-S planned</span>
      </footer>
    </div>
  );
}

export default App;
