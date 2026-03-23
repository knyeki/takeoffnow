"use client";

import { useState } from "react";

const FEATURES = [
  {
    title: "Upload Plans",
    description:
      "Drop your architectural PDFs and our AI reads every glazing detail — storefront, curtain wall, showers, mirrors, skylights, and more.",
    icon: "📄",
  },
  {
    title: "Instant Takeoffs",
    description:
      "Get a professional takeoff workbook in minutes instead of hours. Quantities, dimensions, and specs — all extracted automatically.",
    icon: "⚡",
  },
  {
    title: "Marked-Up Plans",
    description:
      "Receive annotated PDFs showing exactly where each glazing item was found. No more flipping back and forth.",
    icon: "🖊️",
  },
];

export default function Home() {
  const [form, setForm] = useState({ name: "", email: "", company: "" });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error);
        return;
      }

      setStatus("success");
      setMessage("You're on the list! We'll reach out when early access opens.");
      setForm({ name: "", email: "", company: "" });
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400">
          Coming Soon
        </p>
        <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          Glazing takeoffs,{" "}
          <span className="text-blue-400">powered by AI.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
          Upload your architectural plans. Get accurate, professional glazing
          takeoffs in minutes — not hours. Built by glaziers, for glaziers.
        </p>
        <a
          href="#early-access"
          className="mt-10 inline-flex h-12 items-center rounded-full bg-blue-500 px-8 text-base font-semibold text-white transition-colors hover:bg-blue-600"
        >
          Reserve Your Spot
        </a>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-5xl gap-8 px-6 py-20 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8"
          >
            <div className="mb-4 text-3xl">{f.icon}</div>
            <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              {f.description}
            </p>
          </div>
        ))}
      </section>

      {/* Scope list */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="mb-6 text-3xl font-bold">
          Every glazing scope, covered.
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "Storefront",
            "Curtain Wall",
            "Entrance Doors",
            "Interior Partitions",
            "Frameless Glass Walls",
            "Showers",
            "Mirrors",
            "Windows",
            "Skylights",
            "Glass Railings",
            "Distraction Banding",
            "Window Tint",
          ].map((scope) => (
            <span
              key={scope}
              className="rounded-full border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-sm text-zinc-300"
            >
              {scope}
            </span>
          ))}
        </div>
      </section>

      {/* Early Access Form */}
      <section
        id="early-access"
        className="mx-auto w-full max-w-lg px-6 py-20"
      >
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 sm:p-10">
          <h2 className="mb-2 text-2xl font-bold text-center">
            Get Early Access
          </h2>
          <p className="mb-8 text-center text-sm text-zinc-400">
            Be one of the first to try TakeoffNow. No credit card required.
          </p>

          {status === "success" ? (
            <div className="rounded-xl bg-green-900/30 border border-green-700 p-6 text-center">
              <p className="text-green-300 font-medium">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Your name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-12 rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500 transition-colors"
              />
              <input
                type="email"
                placeholder="Work email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-12 rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500 transition-colors"
              />
              <input
                type="text"
                placeholder="Company (optional)"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="h-12 rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500 transition-colors"
              />

              {status === "error" && (
                <p className="text-sm text-red-400">{message}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-2 h-12 rounded-lg bg-blue-500 font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Submitting..." : "Reserve My Spot"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800 px-6 py-8 text-center text-sm text-zinc-500">
        &copy; {new Date().getFullYear()} TakeoffNow.ai — All rights reserved.
      </footer>
    </div>
  );
}
