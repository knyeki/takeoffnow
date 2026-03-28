"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { supabase, user, profile, refreshProfile } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile?.company_name) {
      setCompanyName(profile.company_name);
    }
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !companyName.trim()) return;

    setLoading(true);
    setError("");
    setSaved(false);

    try {
      // Try insert first, fall back to update if profile already exists
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

      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(`Unexpected error: ${err}`);
    }

    setLoading(false);
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-1 text-2xl font-bold text-white">Settings</h1>
      <p className="mb-8 text-sm text-zinc-400">
        Manage your company profile. Your company name appears on all takeoff
        deliverables — PDF summaries, Excel workbooks, and RFI lists.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
          <p className="mt-1 text-xs text-zinc-500">
            This will be used as the branding on your Excel and PDF outputs.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Email
          </label>
          <input
            type="email"
            disabled
            value={user?.email || ""}
            className="h-12 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm text-zinc-500 cursor-not-allowed"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {saved && (
          <p className="text-sm text-green-400">
            Settings saved. Changes will apply to your next takeoff.
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !companyName.trim()}
          className="h-12 w-fit rounded-lg bg-blue-500 px-6 font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
