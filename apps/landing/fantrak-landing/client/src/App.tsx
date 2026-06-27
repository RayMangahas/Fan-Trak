import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const PLATFORMS = ["OnlyFans", "Fansly", "Patreon", "ManyVids", "LoyalFans", "Fanvue", "Mynx", "Other"];
const CREATOR_TYPES = ["Hobby Creator", "Part-Time Creator", "Full-Time Creator", "Agency / Manager"];

const FEATURES = [
  { icon: "💸", title: "Payout Management", desc: "Consolidated payouts from every platform, on your schedule." },
  { icon: "📊", title: "Analytics Dashboard", desc: "One view: earnings, fan growth, and content performance." },
  { icon: "👥", title: "Fan CRM", desc: "Segment, tag, and message your audience like a business." },
  { icon: "📅", title: "Content Scheduling", desc: "Schedule posts and campaigns across platforms in one place." },
  { icon: "💬", title: "Unified Inbox", desc: "Every DM from every platform in a single inbox." },
  { icon: "🛡️", title: "Payment Protection", desc: "Adult-friendly processing with chargeback dispute tools." },
];

const RESEARCH_QUESTIONS = [
  {
    id: "platforms", label: "Q1 - Platforms",
    text: "Which platforms are you currently active on?",
    sub: "Select all that apply.",
    type: "multi",
    options: ["OnlyFans", "Fansly", "Patreon", "ManyVids", "LoyalFans", "Fanvue", "Mynx", "Other"],
  },
  {
    id: "hoursPerDay", label: "Q2 - Daily Time",
    text: "How many hours a day do you spend managing your business?",
    sub: "Include content creation, DMs, scheduling, and admin.",
    type: "single",
    options: ["Under 4 hrs", "4-8 hrs", "8-12 hrs", "12-16 hrs", "16+ hrs"],
  },
  {
    id: "biggestPain", label: "Q3 - Biggest Pain",
    text: "What is your single biggest operational headache right now?",
    sub: "Pick the one that costs you the most time or money.",
    type: "single",
    options: [
      "Chargebacks and payment holds",
      "Managing multiple platforms",
      "DM and fan communication volume",
      "Tracking what is actually making money",
      "Account bans or platform instability",
      "Managing a team or agents",
    ],
  },
  {
    id: "chargeback", label: "Q4 - Payments",
    text: "Have chargebacks or payment holds ever cost you significant income?",
    sub: "We are trying to understand how widespread this is.",
    type: "single",
    options: [
      "Yes - it is a serious problem",
      "Yes - minor but annoying",
      "Not yet but I worry about it",
      "No, not an issue for me",
    ],
  },
  {
    id: "attribution", label: "Q5 - Analytics",
    text: "Can you tell which platform or post is actually driving your revenue?",
    sub: "Knowing what converts to sales, not just what gets views.",
    type: "single",
    options: ["Yes, clearly", "Sort of - educated guess", "Not really", "No idea"],
  },
  {
    id: "consolidationValue", label: "Q6 - Value",
    text: "If one tool handled your payouts, analytics, DMs, and scheduling — how valuable would that be?",
    sub: "Rate 1 (not valuable) to 5 (would switch immediately).",
    type: "scale", min: 1, max: 5,
    minLabel: "Not valuable", maxLabel: "Switch immediately",
  },
  {
    id: "openResponse", label: "Q7 - Open",
    text: "What is the one thing you wish platforms would fix that nobody has fixed yet?",
    sub: "Be as specific as you want.",
    type: "text",
    placeholder: "e.g. I cannot see which post drove a new subscription...",
  },
];

// ─────────────────────────────────────────────
// LOGO SVG
// ─────────────────────────────────────────────
function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-label="Fan-Trak logo">
      <circle cx="14" cy="14" r="12" stroke="#FF0080" strokeWidth="1.6"/>
      <circle cx="14" cy="14" r="7" stroke="#00BFFF" strokeWidth="1.6"/>
      <circle cx="14" cy="14" r="2.5" fill="#FF0080"/>
      <line x1="14" y1="2" x2="14" y2="7" stroke="#FF0080" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="14" y1="21" x2="14" y2="26" stroke="#00BFFF" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="2" y1="14" x2="7" y2="14" stroke="#00BFFF" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="21" y1="14" x2="26" y2="14" stroke="#FF0080" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

// ─────────────────────────────────────────────
// WAITLIST FORM
// ─────────────────────────────────────────────
function WaitlistForm() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", creatorType: "", primaryPlatform: "" });
  const [submitted, setSubmitted] = useState(false);

  const { data: countData } = useQuery<{ count: number }>({
    queryKey: ["/api/waitlist/count"],
  });

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      apiRequest("POST", "/api/waitlist", {
        name: data.name,
        email: data.email,
        creatorType: data.creatorType || null,
        primaryPlatform: data.primaryPlatform || null,
        source: "landing_page",
      }),
    onSuccess: () => setSubmitted(true),
    onError: () => toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" }),
  });

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center success-bounce">
        <div className="relative">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(255,0,128,0.12)", border: "2px solid #FF0080" }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M8 18l7 7 13-13" stroke="#FF0080" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#00BFFF" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7l3 3 5-5" stroke="#0E0E1C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div>
          <p className="text-xl font-bold mb-1">You're on the list, {form.name.split(" ")[0]}.</p>
          <p className="text-sm" style={{ color: "hsl(220 15% 50%)" }}>
            We'll reach out to <span style={{ color: "#00BFFF" }}>{form.email}</span> when your beta access is ready.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold" style={{ background: "rgba(0,191,255,0.1)", color: "#00BFFF", border: "1px solid rgba(0,191,255,0.2)" }}>
          <span>#{(countData?.count ?? 0)}</span>
          <span>in line</span>
        </div>
      </div>
    );
  }

  const canSubmit = form.name.trim() && form.email.includes("@");

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (canSubmit) mutation.mutate(form); }}
      className="flex flex-col gap-3"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          className="ft-input"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          data-testid="input-name"
        />
        <input
          className="ft-input"
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
          data-testid="input-email"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          className="ft-input"
          value={form.creatorType}
          onChange={(e) => setForm(f => ({ ...f, creatorType: e.target.value }))}
          data-testid="select-creator-type"
          style={{ appearance: "none" }}
        >
          <option value="">Creator type (optional)</option>
          {CREATOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className="ft-input"
          value={form.primaryPlatform}
          onChange={(e) => setForm(f => ({ ...f, primaryPlatform: e.target.value }))}
          data-testid="select-platform"
          style={{ appearance: "none" }}
        >
          <option value="">Primary platform (optional)</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <button
        className="btn-primary w-full mt-1"
        type="submit"
        disabled={!canSubmit || mutation.isPending}
        data-testid="button-submit-waitlist"
      >
        {mutation.isPending ? "Saving..." : "Request Early Access"}
        {!mutation.isPending && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {(countData?.count ?? 0) > 0 && (
        <p className="text-center text-xs" style={{ color: "hsl(220 15% 40%)" }}>
          Join {countData!.count} creator{countData!.count !== 1 ? "s" : ""} already on the list
        </p>
      )}
    </form>
  );
}

// ─────────────────────────────────────────────
// FLOOR RESEARCH FORM
// ─────────────────────────────────────────────
type ResearchAnswers = Record<string, string | string[] | number>;

function FloorResearch() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ResearchAnswers>({});
  const [submitted, setSubmitted] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const mutation = useMutation({
    mutationFn: (data: ResearchAnswers) => {
      const platforms = Array.isArray(data.platforms) ? (data.platforms as string[]).join(", ") : "";
      return apiRequest("POST", "/api/research", {
        platforms: platforms || null,
        hoursPerDay: (data.hoursPerDay as string) || null,
        biggestPain: (data.biggestPain as string) || null,
        chargeback: (data.chargeback as string) || null,
        attribution: (data.attribution as string) || null,
        consolidationValue: (data.consolidationValue as number) || null,
        openResponse: (data.openResponse as string) || null,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      setSessionCount(c => c + 1);
    },
    onError: () => toast({ title: "Submit failed", description: "Please try again.", variant: "destructive" }),
  });

  const q = RESEARCH_QUESTIONS[step];
  const totalSteps = RESEARCH_QUESTIONS.length;
  const pct = ((step + 1) / totalSteps) * 100;

  function isSelected(id: string, opt: string) {
    const val = answers[id];
    if (Array.isArray(val)) return val.includes(opt);
    return val === opt;
  }

  function toggle(id: string, opt: string, multi: boolean) {
    if (multi) {
      const arr = (answers[id] as string[]) || [];
      setAnswers(a => ({ ...a, [id]: arr.includes(opt) ? arr.filter(x => x !== opt) : [...arr, opt] }));
    } else {
      setAnswers(a => ({ ...a, [id]: opt }));
    }
  }

  function canAdvance() {
    if (q.type === "text") return true;
    if (q.type === "multi") {
      const v = answers[q.id];
      return Array.isArray(v) && v.length > 0;
    }
    return answers[q.id] !== undefined && answers[q.id] !== "";
  }

  function restart() {
    setAnswers({});
    setStep(0);
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-5 text-center py-8 success-bounce">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(255,0,128,0.1)", border: "1.5px solid #FF0080" }}>
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <path d="M7 15l6 6 10-10" stroke="#FF0080" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-lg font-bold mb-1">Response saved</p>
          <p className="text-sm" style={{ color: "hsl(220 15% 50%)" }}>
            Synced to Google Sheets automatically.
          </p>
        </div>
        {sessionCount > 0 && (
          <div className="text-xs" style={{ color: "#00BFFF" }}>{sessionCount} response{sessionCount !== 1 ? "s" : ""} this session</div>
        )}
        <button className="btn-ghost" onClick={restart} data-testid="button-new-response">New Response</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 fade-in">
      {/* Progress */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold" style={{ color: "#FF0080" }}>{q.label}</span>
        <span className="text-xs" style={{ color: "hsl(220 15% 45%)" }}>Q{step + 1} of {totalSteps}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* Question */}
      <div>
        <p className="text-base font-bold leading-snug mb-1">{q.text}</p>
        <p className="text-xs" style={{ color: "hsl(220 15% 50%)" }}>{q.sub}</p>
      </div>

      {/* Chips */}
      {(q.type === "single" || q.type === "multi") && (
        <div className="flex flex-wrap gap-2">
          {q.options!.map(opt => (
            <button
              key={opt}
              className={"chip" + (isSelected(q.id, opt) ? " selected" : "")}
              onClick={() => toggle(q.id, opt, q.type === "multi")}
              type="button"
              data-testid={`chip-${opt.replace(/\s+/g, "-").toLowerCase()}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Scale */}
      {q.type === "scale" && (
        <div>
          <div className="flex gap-2 mb-2">
            {Array.from({ length: q.max! - q.min! + 1 }, (_, i) => i + q.min!).map(n => (
              <button
                key={n}
                className={"scale-btn" + (answers[q.id] === n ? " selected" : "")}
                onClick={() => setAnswers(a => ({ ...a, [q.id]: n }))}
                type="button"
                data-testid={`scale-${n}`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs" style={{ color: "hsl(220 15% 45%)" }}>
            <span>{q.minLabel}</span><span>{q.maxLabel}</span>
          </div>
        </div>
      )}

      {/* Text */}
      {q.type === "text" && (
        <textarea
          className="ft-textarea"
          rows={3}
          placeholder={q.placeholder}
          value={(answers[q.id] as string) || ""}
          onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
          data-testid="textarea-open-response"
        />
      )}

      {/* Nav */}
      <div className="flex gap-2 mt-2">
        {step > 0 && (
          <button className="btn-ghost" onClick={() => setStep(s => s - 1)} type="button" data-testid="button-back">
            Back
          </button>
        )}
        <button
          className="btn-primary flex-1"
          disabled={!canAdvance() || mutation.isPending}
          onClick={() => {
            if (step < totalSteps - 1) setStep(s => s + 1);
            else mutation.mutate(answers);
          }}
          type="button"
          data-testid="button-next"
        >
          {mutation.isPending ? "Saving..." : step < totalSteps - 1 ? "Continue" : "Submit"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const researchRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen">
      <Toaster />

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4" style={{ background: "rgba(14,14,28,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="font-bold text-sm tracking-wide">
            <span style={{ color: "#FF0080" }}>FAN</span>
            <span style={{ color: "hsl(220 15% 55%)" }}>-</span>
            <span style={{ color: "#00BFFF" }}>TRAK</span>
          </span>
        </div>
        <button
          className="btn-primary"
          style={{ padding: "9px 18px", fontSize: "13px" }}
          onClick={() => document.getElementById("waitlist-section")?.scrollIntoView({ behavior: "smooth" })}
        >
          Get Early Access
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="grid-bg relative px-6 pt-20 pb-24 text-center" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: "rgba(255,0,128,0.1)", color: "#FF0080", border: "1px solid rgba(255,0,128,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Beta launching soon
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5">
            Your entire creator business,{" "}
            <span className="grad-text">finally in one place.</span>
          </h1>
          <p className="text-base sm:text-lg mb-10 max-w-xl mx-auto" style={{ color: "hsl(220 15% 55%)" }}>
            Fan-Trak consolidates your payouts, analytics, DMs, and fan management across every platform — so you can spend more time creating and less time managing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className="btn-primary"
              style={{ padding: "15px 32px", fontSize: "16px" }}
              onClick={() => document.getElementById("waitlist-section")?.scrollIntoView({ behavior: "smooth" })}
            >
              Join the Waitlist
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3.5 9h11M10 4.5l4.5 4.5L10 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className="btn-ghost"
              style={{ padding: "15px 28px", fontSize: "15px" }}
              onClick={() => researchRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              Share feedback
            </button>
          </div>
        </div>
      </section>

      {/* ── PAIN STATS ── */}
      <section className="px-6 py-14" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold tracking-widest uppercase mb-8" style={{ color: "hsl(220 15% 40%)" }}>
            What we heard from creators at Exxxotica
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { stat: "12+", label: "hours a day managing admin", color: "#FF0080" },
              { stat: "4–7", label: "platforms juggled at once", color: "#00BFFF" },
              { stat: "#1", label: "pain point: chargebacks & holds", color: "#FF0080" },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-6 text-center" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                <div className="text-3xl font-black mb-1" style={{ color: item.color }}>{item.stat}</div>
                <div className="text-sm" style={{ color: "hsl(220 15% 55%)" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="px-6 py-16" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-2">Everything in one dashboard.</h2>
          <p className="text-center text-sm mb-10" style={{ color: "hsl(220 15% 50%)" }}>Built for creators who run their business seriously.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="rounded-xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                <div className="text-2xl mb-3">{f.icon}</div>
                <p className="font-bold text-sm mb-1">{f.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(220 15% 50%)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WAITLIST ── */}
      <section id="waitlist-section" className="px-6 py-16" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl p-8 glow-m" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            <div className="text-center mb-7">
              <div className="flex justify-center mb-4">
                <Logo size={40} />
              </div>
              <h2 className="text-xl font-black mb-1">Get Early Access</h2>
              <p className="text-sm" style={{ color: "hsl(220 15% 50%)" }}>
                Beta spots are limited. Be first to know when Fan-Trak launches.
              </p>
            </div>
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* ── FLOOR RESEARCH ── */}
      <section ref={researchRef} className="px-6 py-16">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4" style={{ background: "rgba(0,191,255,0.08)", color: "#00BFFF", border: "1px solid rgba(0,191,255,0.2)" }}>
              Research Survey
            </div>
            <h2 className="text-xl font-black mb-1">Help us build what you actually need.</h2>
            <p className="text-sm" style={{ color: "hsl(220 15% 50%)" }}>7 questions, under 2 minutes. Responses go directly to our research team.</p>
          </div>
          <div className="rounded-2xl p-7 glow-c" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            <FloorResearch />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-8 text-center" style={{ borderTop: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Logo size={18} />
          <span className="text-xs font-bold">
            <span style={{ color: "#FF0080" }}>FAN</span>
            <span style={{ color: "hsl(220 15% 40%)" }}>-</span>
            <span style={{ color: "#00BFFF" }}>TRAK</span>
          </span>
        </div>
        <p className="text-xs" style={{ color: "hsl(220 15% 35%)" }}>
          beta@fan-track.com &nbsp;·&nbsp; fan-track.com/beta
        </p>
      </footer>
    </div>
  );
}
