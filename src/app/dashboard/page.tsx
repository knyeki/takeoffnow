"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface Job {
  id: string;
  project_name: string;
  pdf_filename: string;
  status: "pending" | "processing" | "completed" | "failed";
  current_stage: string | null;
  progress: number;
  created_at: string;
  budget_total: number | null;
  bid_total: number | null;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-900/30 text-yellow-300 border-yellow-700",
  processing: "bg-blue-900/30 text-blue-300 border-blue-700",
  completed: "bg-green-900/30 text-green-300 border-green-700",
  failed: "bg-red-900/30 text-red-300 border-red-700",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCurrency(val: number | null) {
  if (val == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

export default function DashboardPage() {
  const { supabase, user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchJobs() {
      const { data } = await supabase
        .from("jobs")
        .select(
          "id, project_name, pdf_filename, status, current_stage, progress, created_at, budget_total, bid_total"
        )
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      setJobs(data || []);
      setLoading(false);
    }

    fetchJobs();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, [supabase, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-5xl">📋</div>
        <h2 className="mb-2 text-xl font-semibold">No takeoffs yet</h2>
        <p className="mb-6 text-sm text-zinc-400">
          Upload your first set of architectural plans to get started.
        </p>
        <Link
          href="/dashboard/upload"
          className="inline-flex h-10 items-center rounded-lg bg-blue-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
        >
          New Takeoff
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Takeoffs</h1>
        <Link
          href="/dashboard/upload"
          className="inline-flex h-10 items-center rounded-lg bg-blue-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
        >
          New Takeoff
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/50">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-400">Project</th>
              <th className="px-4 py-3 font-medium text-zinc-400">File</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Bid Total</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="transition-colors hover:bg-zinc-800/50"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/jobs/${job.id}`}
                    className="font-medium text-white hover:text-blue-400"
                  >
                    {job.project_name || "Untitled"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {job.pdf_filename}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[job.status]}`}
                  >
                    {job.status === "processing"
                      ? `${job.current_stage || "Processing"} (${job.progress}%)`
                      : job.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {formatCurrency(job.bid_total)}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {formatDate(job.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
