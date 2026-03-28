"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const { supabase, user } = useAuth();
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !companyName.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Try insert first, fall back to update if profile exists
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        company_name: companyName.trim(),
      });

      if (insertError) {
        if (insertError.code === "23505") {
          // Duplicate key — profile exists, update instead
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ company_name: companyName.trim() })
            .eq("id", user.id);

          if (updateError) {
            console.error("Supabase update error:", updateError);
            setError(`Failed to save: ${updateError.message} (${updateError.code})`);
            setLoading(false);
            return;
          }
        } else {
          console.error("Supabase insert error:", insertError);
          setError(`Failed to save: ${insertError.message} (${insertError.code})`);
          setLoading(false);
          return;
        }
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(`Unexpected error: ${err}`);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-center">
          Welcome to TakeoffNow
        </h1>
        <p className="mb-8 text-center text-sm text-zinc-400">
          Your company name will appear on all takeoff deliverables — PDF
          summaries, Excel workbooks, and RFI lists.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Company Name
            </label>
            <input
              type="text"
              placeholder="e.g. Precision Glass & Glazing"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-12 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !companyName.trim()}
            className="h-12 rounded-lg bg-blue-500 font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Get Started"}
          </button>
        </form>
      </div>
    </div>
  );
}
