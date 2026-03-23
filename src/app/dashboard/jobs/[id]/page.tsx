"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Job {
  id: string;
  project_name: string;
  pdf_filename: string;
  pdf_storage_path: string;
  status: "pending" | "processing" | "completed" | "failed";
  current_stage: string | null;
  progress: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  excel_storage_path: string | null;
  pdf_summary_storage_path: string | null;
  rfi_json: Record<string, unknown>[] | null;
  total_storefronts: number | null;
  total_dlos: number | null;
  total_doors: number | null;
  total_labor_hours: number | null;
  budget_total: number | null;
  bid_total: number | null;
  rfi_count: number | null;
  created_at: string;
}

function formatCurrency(val: number | null) {
  if (val == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default function JobDetailPage() {
  const { supabase, user } = useAuth();
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !jobId) return;

    async function fetchJob() {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .eq("user_id", user!.id)
        .single();

      if (data) setJob(data);
      setLoading(false);
    }

    fetchJob();

    // Poll every 5 seconds while job is in progress
    const interval = setInterval(() => {
      if (job?.status === "completed" || job?.status === "failed") return;
      fetchJob();
    }, 5000);

    return () => clearInterval(interval);
  }, [supabase, user, jobId, job?.status]);

  async function handleDownload(
    bucket: string,
    path: string,
    filename: string
  ) {
    setDownloading(filename);
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 300); // 5 min expiry

      if (error || !data?.signedUrl) {
        alert("Failed to generate download link. Please try again.");
        return;
      }

      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = filename;
      a.click();
    } finally {
      setDownloading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-semibold">Job not found</h2>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300"
        >
          Back to Jobs
        </Link>
      </div>
    );
  }

  const isActive = job.status === "pending" || job.status === "processing";

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-block text-sm text-zinc-400 hover:text-white"
        >
          &larr; Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold">
          {job.project_name || "Untitled"}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">{job.pdf_filename}</p>
      </div>

      {/* Progress section */}
      {isActive && (
        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-300">
              {job.current_stage || "Initializing..."}
            </span>
            <span className="text-sm font-semibold text-blue-400">
              {job.progress}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            Pipeline is running — this page updates automatically
          </div>
        </div>
      )}

      {/* Error message */}
      {job.status === "failed" && (
        <div className="mb-8 rounded-xl border border-red-700 bg-red-900/20 p-6">
          <h3 className="mb-1 font-semibold text-red-300">Takeoff Failed</h3>
          <p className="text-sm text-red-400">
            {job.error_message || "An unknown error occurred."}
          </p>
        </div>
      )}

      {/* Completed — Downloads */}
      {job.status === "completed" && (
        <div className="mb-8 rounded-xl border border-green-700 bg-green-900/20 p-6">
          <h3 className="mb-4 font-semibold text-green-300">
            Takeoff Complete
          </h3>
          <div className="flex flex-wrap gap-3">
            {job.excel_storage_path && (
              <button
                onClick={() =>
                  handleDownload(
                    "outputs",
                    job.excel_storage_path!,
                    `${job.project_name || "takeoff"}.xlsx`
                  )
                }
                disabled={downloading !== null}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {downloading?.endsWith(".xlsx")
                  ? "Generating link..."
                  : "Download Excel Workbook"}
              </button>
            )}
            {job.pdf_summary_storage_path && (
              <button
                onClick={() =>
                  handleDownload(
                    "outputs",
                    job.pdf_summary_storage_path!,
                    `${job.project_name || "takeoff"}-summary.pdf`
                  )
                }
                disabled={downloading !== null}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-green-600 px-5 text-sm font-semibold text-green-300 transition-colors hover:bg-green-900/30 disabled:opacity-50"
              >
                {downloading?.endsWith(".pdf")
                  ? "Generating link..."
                  : "Download PDF Summary"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {job.status === "completed" && (
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Key Metrics</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard
              label="Total DLOs"
              value={job.total_dlos?.toString() || "—"}
            />
            <MetricCard
              label="Doors"
              value={job.total_doors?.toString() || "—"}
            />
            <MetricCard
              label="Storefronts"
              value={job.total_storefronts?.toString() || "—"}
            />
            <MetricCard
              label="Labor Hours"
              value={
                job.total_labor_hours
                  ? `${job.total_labor_hours.toLocaleString()} hrs`
                  : "—"
              }
            />
            <MetricCard
              label="Budget Total"
              value={formatCurrency(job.budget_total)}
            />
            <MetricCard
              label="Bid Total"
              value={formatCurrency(job.bid_total)}
            />
            <MetricCard
              label="RFI Count"
              value={job.rfi_count?.toString() || "0"}
            />
            <MetricCard
              label="Completed"
              value={formatDate(job.completed_at)}
            />
          </div>
        </div>
      )}

      {/* RFI Summary */}
      {job.status === "completed" &&
        job.rfi_json &&
        Array.isArray(job.rfi_json) &&
        job.rfi_json.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold">
              RFIs ({job.rfi_json.length})
            </h3>
            <div className="overflow-hidden rounded-xl border border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-zinc-400">#</th>
                    <th className="px-4 py-3 font-medium text-zinc-400">
                      Description
                    </th>
                    <th className="px-4 py-3 font-medium text-zinc-400">
                      Sheet
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {job.rfi_json.map((rfi, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-zinc-400">{i + 1}</td>
                      <td className="px-4 py-3 text-zinc-300">
                        {(rfi as Record<string, unknown>).description as string || "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {(rfi as Record<string, unknown>).sheet as string || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Timestamps */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-sm text-zinc-400">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-zinc-500">Created:</span>{" "}
            {formatDate(job.created_at)}
          </div>
          <div>
            <span className="text-zinc-500">Started:</span>{" "}
            {formatDate(job.started_at)}
          </div>
          {job.completed_at && (
            <div>
              <span className="text-zinc-500">Completed:</span>{" "}
              {formatDate(job.completed_at)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
