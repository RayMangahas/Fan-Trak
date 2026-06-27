import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Star, CheckCircle2, ChevronRight, ChevronLeft, BarChart3, Users, Zap } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────
type FormData = {
  // ── Step 0: Personal Info ──────────────────────────────────
  fullName: string;
  stageName: string;
  personalEmail: string;
  creatorTypeSelf: string;
  hasManager: boolean | null;
  managerName: string;
  companyName: string;
  companyEmail: string;
  // ── Steps 1–4: Survey ────────────────────────────────────
  creatorType: string;
  currentPlatforms: string[];
  ratings: Record<string, number>;
  comments: Record<string, string>;
  overallScore: number;
  biggestPainPoint: string;
  mostWantedFeature: string;
  additionalComments: string;
  wouldJoinBeta: boolean | null;
  email: string;
};

const FEATURES = [
  { key: "payouts",           label: "Payout Management",        desc: "Speed, reliability, and rates of creator payouts" },
  { key: "analytics",         label: "Analytics Dashboard",       desc: "Earnings, fan growth, and content performance data" },
  { key: "fanManagement",     label: "Fan Management",            desc: "CRM tools to manage, segment, and engage your audience" },
  { key: "scheduling",        label: "Content Scheduling",        desc: "Schedule posts and campaigns across platforms" },
  { key: "messaging",         label: "Direct Messaging",          desc: "Inbox and DM management for fan communication" },
  { key: "paymentProcessing", label: "Payment Processing",        desc: "Adult-friendly payment processing with no surprise bans" },
  { key: "onboarding",        label: "Creator Onboarding",        desc: "Ease of getting set up and earning your first payout" },
  { key: "mobileApp",         label: "Mobile App",                desc: "Manage your account and respond to fans on the go" },
];

const PLATFORMS = ["OnlyFans", "Fansly", "Patreon", "Fanvue", "ManyVids", "LoyalFans", "Other"];
const PAIN_POINTS = [
  "High platform fees / low payout rates",
  "Surprise account bans or payment holds",
  "Poor analytics and earnings visibility",
  "Slow or unreliable payouts",
  "Scattered tools across multiple platforms",
  "Lack of fan data and audience ownership",
  "Poor mobile experience",
  "Weak customer support",
  "Other",
];

const WANTED_FEATURES = [
  "Unified dashboard for all platforms",
  "Faster / higher-rate payouts",
  "Built-in CRM and fan segmentation",
  "Content scheduling & auto-posting",
  "Advanced analytics and earnings projections",
  "Adult-friendly payment processing guarantee",
  "Fan migration toolkit",
  "Mobile-first management app",
  "Other",
];

// ── Star Rating Component ─────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          className="star-btn"
          data-testid={`star-${n}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            size={26}
            className={`transition-colors ${(hovered || value) >= n ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`}
          />
        </button>
      ))}
      {(hovered || value) > 0 && (
        <span className="ml-2 text-sm font-medium" style={{ color: "hsl(197 100% 50%)" }}>
          {labels[hovered || value]}
        </span>
      )}
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs mb-2" style={{ color: "hsl(220 15% 55%)" }}>
        <span>Step {step} of {total}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "hsl(220 15% 88%)" }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Stats Panel ───────────────────────────────────────────────
function StatsPanel() {
  const { data: stats } = useQuery<{
    total: number;
    avgRatings: Record<string, number>;
    wouldJoinBetaCount: number;
    creatorTypeBreakdown: Record<string, number>;
  }>({ queryKey: ["/api/survey/stats"] });

  if (!stats || stats.total === 0) return null;

  const topRated = stats.total > 0
    ? Object.entries(stats.avgRatings)
        .map(([key, val]) => ({ label: FEATURES.find(f => `rating${f.key.charAt(0).toUpperCase() + f.key.slice(1)}` === key)?.label || key, val }))
        .sort((a, b) => b.val - a.val)
        .slice(0, 3)
    : [];

  return (
    <div className="rounded-lg p-4 mb-6 border" style={{ background: "hsl(0 0% 98%)", borderColor: "hsl(220 15% 82%)" }}>
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={16} style={{ color: "hsl(197 100% 50%)" }} />
        <span className="text-sm font-semibold" style={{ color: "hsl(197 100% 50%)" }}>Live Community Feedback</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className="text-xl font-bold grad-text">{stats.total}</div>
          <div className="text-xs" style={{ color: "hsl(220 15% 55%)" }}>Responses</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold grad-text">{stats.wouldJoinBetaCount}</div>
          <div className="text-xs" style={{ color: "hsl(220 15% 55%)" }}>Want Beta Access</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold grad-text">
            {stats.total > 0 ? Math.round((stats.wouldJoinBetaCount / stats.total) * 100) : 0}%
          </div>
          <div className="text-xs" style={{ color: "hsl(220 15% 55%)" }}>Would Join</div>
        </div>
      </div>
      {topRated.length > 0 && (
        <div>
          <div className="text-xs mb-2" style={{ color: "hsl(220 15% 55%)" }}>Top-rated features:</div>
          {topRated.map(({ label, val }) => (
            <div key={label} className="flex items-center justify-between text-xs mb-1">
              <span style={{ color: "hsl(220 25% 20%)" }}>{label}</span>
              <div className="flex items-center gap-1">
                <Star size={11} className="fill-yellow-400 text-yellow-400" />
                <span style={{ color: "hsl(220 25% 20%)" }}>{val}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Thank You Screen ──────────────────────────────────────────
function ThankYou({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="mb-6 rounded-full p-4" style={{ background: "hsl(220 15% 96%)" }}>
        <CheckCircle2 size={48} style={{ color: "hsl(326 100% 50%)" }} />
      </div>
      <h2 className="text-xl font-bold mb-3">Thank you for your feedback!</h2>
      <p className="text-sm mb-1" style={{ color: "hsl(220 15% 60%)" }}>Your response has been recorded.</p>
      <p className="text-sm mb-8" style={{ color: "hsl(220 15% 60%)" }}>
        We'll use your input to shape what Fan-Trak builds next.
      </p>
      <div className="rounded-lg p-5 mb-8 w-full max-w-sm border text-left" style={{ background: "hsl(0 0% 98%)", borderColor: "hsl(326 100% 50% / 30%)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} style={{ color: "hsl(326 100% 50%)" }} />
          <span className="font-semibold text-sm" style={{ color: "hsl(326 100% 50%)" }}>What happens next</span>
        </div>
        <ul className="space-y-2 text-sm" style={{ color: "hsl(220 15% 65%)" }}>
          <li>• We review every response personally</li>
          <li>• High-demand features move to the top of our roadmap</li>
          <li>• Beta invites go out to creators who opted in first</li>
        </ul>
      </div>
      <a
        href="https://fan-track.com/beta"
        className="inline-block rounded-md font-semibold text-sm px-6 py-3 mb-4"
        style={{ background: "hsl(326 100% 50%)", color: "#fff" }}
      >
        Apply for Beta Access →
      </a>
      <button
        onClick={onReset}
        className="text-xs underline"
        style={{ color: "hsl(220 15% 50%)" }}
      >
        Submit another response
      </button>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const TOTAL_STEPS = 5;

  const [form, setForm] = useState<FormData>({
    fullName: "",
    stageName: "",
    personalEmail: "",
    creatorTypeSelf: "",
    hasManager: null,
    managerName: "",
    companyName: "",
    companyEmail: "",
    creatorType: "",
    currentPlatforms: [],
    ratings: {},
    comments: {},
    overallScore: 0,
    biggestPainPoint: "",
    mostWantedFeature: "",
    additionalComments: "",
    wouldJoinBeta: null,
    email: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload: Record<string, unknown> = {
        fullName: data.fullName || null,
        stageName: data.stageName || null,
        personalEmail: data.personalEmail || null,
        creatorTypeSelf: data.creatorTypeSelf || null,
        hasManager: data.hasManager ? 1 : 0,
        managerName: data.managerName || null,
        companyName: data.companyName || null,
        companyEmail: data.companyEmail || null,
        creatorType: data.creatorType,
        currentPlatforms: JSON.stringify(data.currentPlatforms),
        overallScore: data.overallScore || null,
        biggestPainPoint: data.biggestPainPoint || null,
        mostWantedFeature: data.mostWantedFeature || null,
        additionalComments: data.additionalComments || null,
        wouldJoinBeta: data.wouldJoinBeta ? 1 : 0,
        email: data.email || null,
      };
      for (const f of FEATURES) {
        const rKey = `rating${f.key.charAt(0).toUpperCase() + f.key.slice(1)}`;
        const cKey = `comment${f.key.charAt(0).toUpperCase() + f.key.slice(1)}`;
        payload[rKey] = data.ratings[f.key] || null;
        payload[cKey] = data.comments[f.key] || null;
      }
      return apiRequest("POST", "/api/survey", payload);
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/survey/stats"] });
    },
    onError: () => {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    },
  });

  const setRating = (key: string, val: number) =>
    setForm(f => ({ ...f, ratings: { ...f.ratings, [key]: val } }));

  const setComment = (key: string, val: string) =>
    setForm(f => ({ ...f, comments: { ...f.comments, [key]: val } }));

  const togglePlatform = (p: string) =>
    setForm(f => ({
      ...f,
      currentPlatforms: f.currentPlatforms.includes(p)
        ? f.currentPlatforms.filter(x => x !== p)
        : [...f.currentPlatforms, p],
    }));

  const canAdvance = () => {
    if (step === 1) return !!form.fullName.trim() && !!form.personalEmail.trim() && !!form.creatorTypeSelf && form.hasManager !== null;
    if (step === 2) return !!form.creatorType && form.currentPlatforms.length > 0;
    if (step === 3) return FEATURES.every(f => !!form.ratings[f.key]);
    if (step === 4) return !!form.biggestPainPoint && !!form.mostWantedFeature && form.overallScore > 0;
    return true;
  };

  const handleSubmit = () => {
    mutation.mutate(form);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-start justify-center p-4 pt-12">
        <div className="w-full max-w-xl">
          <Header />
          <div className="rounded-xl border" style={{ background: "hsl(0 0% 98%)", borderColor: "hsl(220 15% 82%)" }}>
            <ThankYou onReset={() => { setSubmitted(false); setStep(1); setForm({ fullName:"", stageName:"", personalEmail:"", creatorTypeSelf:"", hasManager:null, managerName:"", companyName:"", companyEmail:"", creatorType:"", currentPlatforms:[], ratings:{}, comments:{}, overallScore:0, biggestPainPoint:"", mostWantedFeature:"", additionalComments:"", wouldJoinBeta:null, email:"" }); }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center p-4 pt-12 pb-16">
      <div className="w-full max-w-xl">
        <Header />
        <StatsPanel />
        <div className="rounded-xl border p-6" style={{ background: "hsl(0 0% 98%)", borderColor: "hsl(220 15% 82%)" }}>
          <ProgressBar step={step} total={TOTAL_STEPS} />

          {/* STEP 1 — Personal Info (NEW FIRST PAGE) */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold mb-1" style={{ color: "hsl(197 100% 65%)" }}>Your Information</h2>
              <p className="text-sm mb-5" style={{ color: "hsl(220 15% 55%)" }}>
                Help us put a name to this response. All fields except Stage Name are required.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: "hsl(220 15% 65%)" }}>Full Name <span style={{ color: "hsl(326 100% 60%)" }}>*</span></label>
                  <input
                    type="text"
                    placeholder="First & Last"
                    value={form.fullName}
                    onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                    style={{ background: "hsl(220 15% 96%)", borderColor: "hsl(220 15% 82%)", color: "hsl(220 25% 12%)" } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: "hsl(220 15% 65%)" }}>Stage / Creator Name <span style={{ color: "hsl(220 15% 40%)" }}>(optional)</span></label>
                  <input
                    type="text"
                    placeholder="@handle or alias"
                    value={form.stageName}
                    onChange={e => setForm(f => ({ ...f, stageName: e.target.value }))}
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                    style={{ background: "hsl(220 15% 96%)", borderColor: "hsl(220 15% 82%)", color: "hsl(220 25% 12%)" } as React.CSSProperties}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold mb-1 block" style={{ color: "hsl(220 15% 65%)" }}>Email Address <span style={{ color: "hsl(326 100% 60%)" }}>*</span></label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={form.personalEmail}
                  onChange={e => setForm(f => ({ ...f, personalEmail: e.target.value }))}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                  style={{ background: "hsl(220 15% 96%)", borderColor: "hsl(220 15% 82%)", color: "hsl(220 25% 12%)" } as React.CSSProperties}
                />
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold mb-2 block" style={{ color: "hsl(220 15% 65%)" }}>Creator Type <span style={{ color: "hsl(326 100% 60%)" }}>*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {["Hobby Creator", "Part-Time Creator", "Full-Time Creator", "Agency / Manager"].map(ct => (
                    <button key={ct} type="button"
                      onClick={() => setForm(f => ({ ...f, creatorTypeSelf: ct }))}
                      className="rounded-md px-3 py-2.5 text-sm font-medium text-left border transition-all"
                      style={{
                        background: form.creatorTypeSelf === ct ? "rgba(255,0,128,0.10)" : "hsl(220 15% 96%)",
                        borderColor: form.creatorTypeSelf === ct ? "#FF0080" : "hsl(220 15% 82%)",
                        color: form.creatorTypeSelf === ct ? "#FF0080" : "hsl(220 25% 12%)",
                      }}
                    >{ct}</button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold mb-2 block" style={{ color: "hsl(220 15% 65%)" }}>Do you have a Manager? <span style={{ color: "hsl(326 100% 60%)" }}>*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {[true, false].map(val => (
                    <button key={String(val)} type="button"
                      onClick={() => setForm(f => ({ ...f, hasManager: val }))}
                      className="rounded-md py-2.5 text-sm font-semibold border transition-all"
                      style={{
                        background: form.hasManager === val ? "rgba(0,191,255,0.10)" : "hsl(220 15% 96%)",
                        borderColor: form.hasManager === val ? "#00BFFF" : "hsl(220 15% 82%)",
                        color: form.hasManager === val ? "hsl(197 100% 70%)" : "hsl(220 15% 60%)",
                      }}
                    >{val ? "Yes" : "No"}</button>
                  ))}
                </div>
              </div>

              {form.hasManager === true && (
                <div className="rounded-lg border p-4 space-y-3" style={{ background: "hsl(0 0% 98%)", borderColor: "hsl(220 15% 82%)" }}>
                  <p className="text-xs font-semibold" style={{ color: "hsl(197 100% 60%)" }}>Manager / Company Details</p>
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: "hsl(220 15% 65%)" }}>Manager Name</label>
                    <input type="text" placeholder="Manager's full name"
                      value={form.managerName}
                      onChange={e => setForm(f => ({ ...f, managerName: e.target.value }))}
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                      style={{ background: "hsl(220 15% 96%)", borderColor: "hsl(220 15% 82%)", color: "hsl(220 25% 12%)" } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: "hsl(220 15% 65%)" }}>Company Name</label>
                    <input type="text" placeholder="Agency or company name"
                      value={form.companyName}
                      onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                      style={{ background: "hsl(220 15% 96%)", borderColor: "hsl(220 15% 82%)", color: "hsl(220 25% 12%)" } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: "hsl(220 15% 65%)" }}>Company / Manager Email</label>
                    <input type="email" placeholder="contact@agency.com"
                      value={form.companyEmail}
                      onChange={e => setForm(f => ({ ...f, companyEmail: e.target.value }))}
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                      style={{ background: "hsl(220 15% 96%)", borderColor: "hsl(220 15% 82%)", color: "hsl(220 25% 12%)" } as React.CSSProperties}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — About You (was Step 1) */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold mb-1">About You</h2>
              <p className="text-sm mb-5" style={{ color: "hsl(220 15% 55%)" }}>
                Help us understand your creator profile.
              </p>

              <div className="mb-5">
                <label className="text-sm font-semibold mb-2 block">I am a...</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Hobby Creator", "Part-Time Creator", "Full-Time Creator", "Agency / Manager"].map(ct => (
                    <button
                      key={ct}
                      type="button"
                      data-testid={`creator-type-${ct}`}
                      onClick={() => setForm(f => ({ ...f, creatorType: ct }))}
                      className="rounded-md px-3 py-3 text-sm font-medium text-left border transition-all"
                      style={{
                        background: form.creatorType === ct ? "rgba(255,0,128,0.10)" : "hsl(220 15% 96%)",
                        borderColor: form.creatorType === ct ? "#FF0080" : "hsl(220 15% 82%)",
                        color: form.creatorType === ct ? "#FF0080" : "hsl(220 25% 12%)",
                      }}
                    >
                      {ct}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Platforms you currently use <span style={{ color: "hsl(220 15% 50%)" }}>(select all)</span></label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button
                      key={p}
                      type="button"
                      data-testid={`platform-${p}`}
                      onClick={() => togglePlatform(p)}
                      className="rounded-full px-3 py-1.5 text-xs font-medium border transition-all"
                      style={{
                        background: form.currentPlatforms.includes(p) ? "rgba(0,191,255,0.10)" : "hsl(220 15% 96%)",
                        borderColor: form.currentPlatforms.includes(p) ? "#00BFFF" : "hsl(220 15% 82%)",
                        color: form.currentPlatforms.includes(p) ? "hsl(197 100% 70%)" : "hsl(220 15% 60%)",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Feature Ratings (was Step 2) */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold mb-1">Rate the Features</h2>
              <p className="text-sm mb-5" style={{ color: "hsl(220 15% 55%)" }}>
                Rate each feature from 1–5 stars based on how important it is to you as a creator. Add a comment if you have more to say.
              </p>
              <div className="space-y-5">
                {FEATURES.map((f, i) => (
                  <div key={f.key}>
                    {i > 0 && <hr className="section-sep" />}
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold">{f.label}</div>
                        <div className="text-xs mt-0.5" style={{ color: "hsl(220 15% 55%)" }}>{f.desc}</div>
                      </div>
                    </div>
                    <StarRating
                      value={form.ratings[f.key] || 0}
                      onChange={v => setRating(f.key, v)}
                    />
                    <textarea
                      data-testid={`comment-${f.key}`}
                      placeholder="Add a comment (optional)..."
                      value={form.comments[f.key] || ""}
                      onChange={e => setComment(f.key, e.target.value)}
                      rows={2}
                      className="mt-2 w-full rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1"
                      style={{
                        background: "hsl(220 15% 96%)",
                        borderColor: "hsl(220 15% 82%)",
                        color: "hsl(220 25% 12%)",
                        "--tw-ring-color": "hsl(326 100% 50%)",
                      } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 — Priorities (was Step 3) */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-bold mb-1">Your Priorities</h2>
              <p className="text-sm mb-5" style={{ color: "hsl(220 15% 55%)" }}>
                Tell us what matters most to you right now.
              </p>

              {/* Overall score */}
              <div className="mb-5">
                <label className="text-sm font-semibold mb-2 block">How would you rate your current platform experience overall?</label>
                <StarRating value={form.overallScore} onChange={v => setForm(f => ({ ...f, overallScore: v }))} />
              </div>

              <hr className="section-sep" />

              {/* Biggest pain point */}
              <div className="mb-5">
                <label className="text-sm font-semibold mb-2 block">What is your biggest pain point right now?</label>
                <div className="space-y-2">
                  {PAIN_POINTS.map(p => (
                    <button
                      key={p}
                      type="button"
                      data-testid={`pain-${p}`}
                      onClick={() => setForm(f => ({ ...f, biggestPainPoint: p }))}
                      className="w-full text-left rounded-md px-3 py-2.5 text-sm border transition-all"
                      style={{
                        background: form.biggestPainPoint === p ? "rgba(255,0,128,0.10)" : "hsl(220 15% 96%)",
                        borderColor: form.biggestPainPoint === p ? "#FF0080" : "hsl(220 15% 82%)",
                        color: form.biggestPainPoint === p ? "#FF0080" : "hsl(220 25% 12%)",
                        fontWeight: form.biggestPainPoint === p ? 600 : 400,
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                {form.biggestPainPoint === "Other" && (
                  <textarea
                    className="ft-textarea mt-3"
                    rows={3}
                    maxLength={700}
                    placeholder="Please describe your biggest pain point..."
                    value={form.additionalComments.startsWith("[Pain]: ") ? form.additionalComments.replace(/^\[Pain\]: /, "") : ""}
                    onChange={e => setForm(f => ({ ...f, additionalComments: "[Pain]: " + e.target.value }))}
                  />
                )}
              </div>

              <hr className="section-sep" />

              {/* Most wanted feature */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Which feature would make the biggest difference for you?</label>
                <div className="space-y-2">
                  {WANTED_FEATURES.map(feat => (
                    <button
                      key={feat}
                      type="button"
                      data-testid={`want-${feat}`}
                      onClick={() => setForm(f => ({ ...f, mostWantedFeature: feat }))}
                      className="w-full text-left rounded-md px-3 py-2.5 text-sm border transition-all"
                      style={{
                        background: form.mostWantedFeature === feat ? "rgba(0,191,255,0.10)" : "hsl(220 15% 96%)",
                        borderColor: form.mostWantedFeature === feat ? "#00BFFF" : "hsl(220 15% 82%)",
                        color: form.mostWantedFeature === feat ? "#0099CC" : "hsl(220 25% 12%)",
                        fontWeight: form.mostWantedFeature === feat ? 600 : 400,
                      }}
                    >
                      {feat}
                    </button>
                  ))}
                </div>
                {form.mostWantedFeature === "Other" && (
                  <textarea
                    className="ft-textarea mt-3"
                    rows={3}
                    maxLength={700}
                    placeholder="Please describe the feature you'd most want..."
                    value={form.additionalComments.startsWith("[Feature]: ") ? form.additionalComments.replace(/^\[Feature\]: /, "") : ""}
                    onChange={e => setForm(f => ({ ...f, additionalComments: "[Feature]: " + e.target.value }))}
                  />
                )}
              </div>
            </div>
          )}

          {/* STEP 5 — Final (was Step 4) */}
          {step === 5 && (
            <div>
              <h2 className="text-lg font-bold mb-1">Almost Done</h2>
              <p className="text-sm mb-5" style={{ color: "hsl(220 15% 55%)" }}>
                Any final thoughts? And let us know if you'd like beta access.
              </p>

              <div className="mb-5">
                <label className="text-sm font-semibold mb-2 block">Anything else you want us to know? <span style={{ color: "hsl(220 15% 50%)" }}>(optional)</span></label>
                <textarea
                  data-testid="additional-comments"
                  placeholder="Share any additional thoughts, feature requests, or feedback about Fan-Trak..."
                  value={form.additionalComments}
                  onChange={e => setForm(f => ({ ...f, additionalComments: e.target.value }))}
                  rows={5}
                  maxLength={700}
                  className="ft-textarea"
                />
                <div className="text-xs mt-1 text-right" style={{ color: "hsl(220 15% 45%)" }}>
                  {form.additionalComments.length}/700
                </div>
              </div>

              <hr className="section-sep" />

              <div className="mb-5">
                <label className="text-sm font-semibold mb-3 block">Would you like to join the Fan-Trak private beta?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[true, false].map(val => (
                    <button
                      key={String(val)}
                      type="button"
                      data-testid={`beta-${val}`}
                      onClick={() => setForm(f => ({ ...f, wouldJoinBeta: val }))}
                      className="rounded-md py-3 text-sm font-semibold border transition-all"
                      style={{
                        background: form.wouldJoinBeta === val
                          ? val ? "rgba(255,0,128,0.10)" : "hsl(220 15% 94%)"
                          : "hsl(220 15% 96%)",
                        borderColor: form.wouldJoinBeta === val
                          ? val ? "#FF0080" : "hsl(220 15% 65%)"
                          : "hsl(220 15% 82%)",
                        color: form.wouldJoinBeta === val
                          ? val ? "#FF0080" : "hsl(220 25% 20%)"
                          : "hsl(220 25% 35%)",
                      }}
                    >
                      {val ? "Yes — sign me up" : "Not right now"}
                    </button>
                  ))}
                </div>
              </div>

              {form.wouldJoinBeta && (
                <div className="mb-5">
                  <label className="text-sm font-semibold mb-2 block">Your email <span style={{ color: "hsl(220 15% 50%)" }}>(optional — for beta invite)</span></label>
                  <input
                    type="email"
                    data-testid="email-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="ft-input"
                  />
                  <p className="text-xs mt-1.5" style={{ color: "hsl(220 15% 45%)" }}>
                    We'll only use this to send your beta invite. No spam.
                  </p>
                </div>
              )}

              <div className="rounded-lg p-4 border" style={{ background: "rgba(0,191,255,0.06)", borderColor: "rgba(0,191,255,0.25)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Users size={14} style={{ color: "hsl(197 100% 50%)" }} />
                  <span className="text-xs font-semibold" style={{ color: "hsl(197 100% 50%)" }}>Your voice shapes Fan-Trak</span>
                </div>
                <p className="text-xs" style={{ color: "hsl(220 15% 55%)" }}>
                  Every response is reviewed by our team. The features you rate highest go to the top of our roadmap. Beta creators get early access to everything we build.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-7 pt-5 border-t" style={{ borderColor: "hsl(220 15% 82%)" }}>
            {step > 1 ? (
              <button
                type="button"
                data-testid="btn-back"
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md border transition-all"
                style={{ borderColor: "hsl(220 15% 82%)", color: "hsl(220 15% 40%)", background: "transparent" }}
              >
                <ChevronLeft size={16} /> Back
              </button>
            ) : <div />}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                data-testid="btn-next"
                disabled={!canAdvance()}
                onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-md transition-all"
                style={{
                  background: canAdvance() ? "linear-gradient(135deg, #FF0080, #00BFFF)" : "hsl(220 15% 85%)",
                  color: canAdvance() ? "#fff" : "hsl(220 15% 40%)",
                  cursor: canAdvance() ? "pointer" : "not-allowed",
                }}
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                data-testid="btn-submit"
                disabled={mutation.isPending}
                onClick={handleSubmit}
                className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-md transition-all"
                style={{
                  background: "hsl(326 100% 50%)",
                  color: "#fff",
                  opacity: mutation.isPending ? 0.7 : 1,
                }}
              >
                {mutation.isPending ? "Submitting..." : "Submit Feedback"}
              </button>
            )}
          </div>
        </div>
        <p className="text-center text-xs mt-4" style={{ color: "hsl(220 15% 35%)" }}>
          Takes about 3–5 minutes · Your feedback is confidential
        </p>
      </div>
      <Toaster />
    </div>
  );
}

function Header() {
  return (
    <div className="text-center mb-6">
      {/* SVG Logo */}
      <div className="flex justify-center mb-4">
        <svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Fan-Trak">
          <circle cx="16" cy="16" r="14" stroke="hsl(326,100%,50%)" strokeWidth="1.5"/>
          <circle cx="16" cy="16" r="8" stroke="hsl(197,100%,50%)" strokeWidth="1.5"/>
          <circle cx="16" cy="16" r="3" fill="hsl(326,100%,50%)"/>
          <line x1="16" y1="2" x2="16" y2="8" stroke="hsl(326,100%,50%)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="16" y1="24" x2="16" y2="30" stroke="hsl(197,100%,50%)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="2" y1="16" x2="8" y2="16" stroke="hsl(197,100%,50%)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="24" y1="16" x2="30" y2="16" stroke="hsl(326,100%,50%)" strokeWidth="1.5" strokeLinecap="round"/>
          <text x="38" y="21" fontFamily="Trebuchet MS, sans-serif" fontWeight="700" fontSize="16" fill="hsl(326,100%,55%)">FAN</text>
          <text x="68" y="21" fontFamily="Trebuchet MS, sans-serif" fontWeight="700" fontSize="16" fill="hsl(220,20%,75%)">-</text>
          <text x="76" y="21" fontFamily="Trebuchet MS, sans-serif" fontWeight="700" fontSize="16" fill="hsl(197,100%,55%)">TRAK</text>
        </svg>
      </div>
      <h1 className="text-xl font-bold mb-1">Creator Platform Survey</h1>
      <p className="text-sm" style={{ color: "hsl(220 15% 55%)" }}>
        Your feedback shapes what we build. Rate our features and tell us what matters most.
      </p>
    </div>
  );
}
