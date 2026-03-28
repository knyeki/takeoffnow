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

    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      company_name: companyName.trim(),
    });

    setLoading(false);

    if (upsertError) {
      console.error("Supabase upsert error:", upsertError);
      setError(`Failed to save: ${upsertError.message} (${upsertError.code})`);
      return;
    }

    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
