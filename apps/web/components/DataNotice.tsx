import { FileJson } from "lucide-react";

interface DataNoticeProps {
  artifactPath?: string;
  origin: "artifact" | "sample";
}

export function DataNotice({ artifactPath, origin }: DataNoticeProps) {
  const isArtifact = origin === "artifact";

  return (
    <div className="flex items-start gap-3 rounded-lg border border-teal-900/10 bg-white/85 p-3 text-sm text-ink shadow-soft-ring">
      <FileJson className="mt-0.5 h-4 w-4 flex-none text-pine" aria-hidden="true" />
      <div>
        <p className="font-semibold">{isArtifact ? "Generated event loaded" : "Sample event loaded"}</p>
        <p className="mt-1 text-ink/70">
          {isArtifact
            ? artifactPath ?? "Using the generated event artifact."
            : "Waiting for ../../artifacts/sample-event.json from the event pipeline."}
        </p>
      </div>
    </div>
  );
}
