"use client";

import { exportSchedulePdf } from "@/lib/exportSchedulePdf";
import type { ControllerCalculatorResult } from "@/types/watering-calculator";
import { useCallback, useState } from "react";

interface ExportPdfButtonProps {
  result: ControllerCalculatorResult;
}

export function ExportPdfButton({ result }: ExportPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await exportSchedulePdf(result);
    } catch {
      setError("Could not create PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [result]);

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-navy)] bg-white px-6 py-2.5 font-semibold text-[var(--color-navy)] transition hover:bg-[var(--color-light-grey)] disabled:cursor-wait disabled:opacity-60"
      >
        <PdfIcon className="h-4 w-4 shrink-0" aria-hidden />
        {loading ? "Creating PDF…" : "Download PDF"}
      </button>
      {error && (
        <p className="text-xs font-medium text-[var(--color-pink)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function PdfIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="15" x2="15" y2="15" />
      <line x1="9" y1="11" x2="13" y2="11" />
    </svg>
  );
}
