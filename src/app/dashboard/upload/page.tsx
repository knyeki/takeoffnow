"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const { supabase, user } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      setError("");
    } else {
      setError("Please upload a PDF file.");
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected?.type === "application/pdf") {
        setFile(selected);
        setError("");
      } else {
        setError("Please upload a PDF file.");
      }
    },
    []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !user) return;

    setUploading(true);
    setError("");

    try {
      // 1. Upload PDF to Supabase Storage (unique path per upload)
      setStatus("Uploading PDF...");
      const timestamp = Date.now();
      const storagePath = `${user.id}/${timestamp}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(storagePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // 2. Create job row
      setStatus("Creating job...");
      const { data: job, error: insertError } = await supabase
        .from("jobs")
        .insert({
          user_id: user.id,
          user_email: user.email,
          project_name: projectName || file.name.replace(/\.pdf$/i, ""),
          pdf_filename: file.name,
          pdf_storage_path: storagePath,
          status: "pending",
          progress: 0,
        })
        .select("id")
        .single();

      if (insertError || !job) {
        throw new Error(`Failed to create job: ${insertError?.message}`);
      }

      // 3. Trigger Modal webhook
      setStatus("Starting takeoff pipeline...");
      const webhookRes = await fetch(
        "https://knyeki--glazing-takeoff-start-takeoff.modal.run",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            job_id: job.id,
            pdf_storage_path: storagePath,
          }),
        }
      );

      if (!webhookRes.ok) {
        // Update job status to failed
        await supabase
          .from("jobs")
          .update({ status: "failed", error_message: "Failed to start pipeline" })
          .eq("id", job.id);
        throw new Error("Failed to start the takeoff pipeline.");
      }

      // 4. Redirect to job detail page
      router.push(`/dashboard/jobs/${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setUploading(false);
      setStatus("");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold">New Glazing Takeoff</h1>
      <p className="mb-8 text-sm text-zinc-400">
        Upload your architectural plans (PDF) and we&apos;ll extract every
        glazing scope item automatically.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Project name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Project Name
          </label>
          <input
            type="text"
            placeholder="e.g. Meridian Office Complex"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="h-12 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Drag and drop zone */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Construction Plans (PDF)
          </label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
              dragOver
                ? "border-blue-500 bg-blue-500/10"
                : file
                  ? "border-green-600 bg-green-900/10"
                  : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
            }`}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            {file ? (
              <div className="text-center">
                <div className="mb-2 text-3xl">✅</div>
                <p className="font-medium text-green-300">{file.name}</p>
                <p className="mt-1 text-xs text-zinc-400">
                  {(file.size / 1024 / 1024).toFixed(1)} MB — Click or drop to
                  replace
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-2 text-3xl">📄</div>
                <p className="font-medium text-zinc-300">
                  Drag &amp; drop your PDF here
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  or click to browse files
                </p>
              </div>
            )}
          </div>
          <input
            id="file-input"
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-700 bg-red-900/20 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {status && (
          <div className="flex items-center gap-2 text-sm text-blue-300">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
            {status}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || uploading}
          className="h-12 rounded-lg bg-blue-500 font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Processing..." : "Start Takeoff"}
        </button>
      </form>
    </div>
  );
}
