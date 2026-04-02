import { useState } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const FUNCTIONS = {
  demand: { label: "Demand Generation", short: "Demand Gen", color: "#3b82f6", owns: "Pipeline from marketing", reports: "CMO / VP Marketing" },
  content: { label: "Content & Editorial", short: "Content", color: "#8b5cf6", owns: "Narrative, thought leadership, SEO", reports: "CMO or VP Marketing" },
  product_marketing: { label: "Product Marketing", short: "PMM", color: "#06b6d4", owns: "Positioning, messaging, launches, competitive intel", reports: "CMO or CPO" },
  enablement: { label: "Sales Enablement", short: "Enablement", color: "#f59e0b", owns: "Rep productivity, onboarding, playbooks, training", reports: "CRO or VP Sales" },
  digital: { label: "Digital & Web", short: "Digital", color: "#10b981", owns: "Website, conversion, SEO/SEM, martech stack", reports: "CMO or CTO" },
  creative: { label: "Creative & Brand", short: "Creative", color: "#ec4899", owns: "Visual identity, brand standards, design production", reports: "CMO" },
  customer_marketing: { label: "Customer Marketing", short: "Cust. Mktg", color: "#f97316", owns: "Expansion pipeline, advocacy, references, community", reports: "CMO or CCO" },
  revenue_ops: { label: "Revenue Operations", short: "RevOps", color: "#22c55e", owns: "CRM, pipeline governance, reporting, tool stack", reports: "CRO or CFO" },
  partnerships: { label: "Partnerships & Alliances", short: "Partnerships", color: "#a855f7", owns: "Channel, co-sell, ecosystem revenue", reports: "CRO or CEO" },
  comms: { label: "Communications & PR", short: "Comms / PR", color: "#64748b", owns: "Media relations, analyst relations, executive visibility", reports: "CMO or CEO" },
};

const STAGES = [
  { value: "seed", label: "Seed / Pre-PMF", sub: "< $2M ARR" },
  { value: "early", label: "Early Growth", sub: "$2–10M ARR" },
  { value: "growth", label: "Growth Stage", sub: "$10–50M ARR" },
  { value: "scale", label: "Scaling", sub: "$50M+ ARR" },
  { value: "pe_portfolio", label: "PE Portfolio Co.", sub: "Post-acquisition" },
];

const MOTIONS = [
  { value: "sales_led", label: "Sales-Led", sub: "AE-driven, outbound" },
  { value: "product_led", label: "Product-Led", sub: "PLG / self-serve" },
  { value: "hybrid", label: "Hybrid", sub: "PLG + sales assist" },
  { value: "channel", label: "Channel / Partner", sub: "Mostly indirect" },
];

// Build sequence by stage + motion
function getBuildSequence(stage, motion, existing) {
  const phases = [];

  // Phase 1 — always
  const phase1 = ["revenue_ops", "product_marketing"];
  if (motion === "sales_led" || motion === "hybrid") phase1.push("enablement");
  if (motion === "product_led" || motion === "hybrid") phase1.push("digital");
  phases.push({ label: "Phase 1 — Foundation", timing: "Now", color: "#22c55e", functions: phase1, rationale: "Revenue operations and product marketing are the foundation of any commercial org. Without RevOps you don't have clean data. Without PMM you don't have a repeatable message. Everything else builds on these two." });

  // Phase 2 — depends on stage
  const phase2 = [];
  if (stage === "seed" || stage === "early") {
    phase2.push("content", "demand");
  } else {
    phase2.push("demand", "content", "creative");
  }
  if (motion !== "product_led") phase2.push("digital");
  phases.push({ label: "Phase 2 — Pipeline Engine", timing: "3–6 months", color: "#3b82f6", functions: [...new Set(phase2)], rationale: "Once positioning is locked, build the pipeline engine. Demand gen without content is a spray-and-pray motion. Content without distribution is a vanity exercise. These two functions are most effective when stood up together with a shared pipeline contribution metric." });

  // Phase 3
  const phase3 = ["customer_marketing"];
  if (stage === "growth" || stage === "scale" || stage === "pe_portfolio") {
    phase3.push("creative");
    if (motion === "channel") phase3.push("partnerships");
  }
  phases.push({ label: "Phase 3 — Retention & Expansion", timing: "6–12 months", color: "#f59e0b", functions: [...new Set(phase3)], rationale: "Customer marketing is chronically underfunded relative to its impact. In most businesses, expansion revenue from existing accounts is higher-margin and faster-close than new logos. This function should own pipeline, not just advocacy." });

  // Phase 4 — mature org
  if (stage === "scale" || stage === "pe_portfolio") {
    const phase4 = ["partnerships", "comms"];
    phases.push({ label: "Phase 4 — Scale & Ecosystem", timing: "12–24 months", color: "#a855f7", functions: [...new Set(phase4)], rationale: "At scale, partnerships and comms become strategic levers rather than tactical support. Partnerships should carry a revenue number. Comms should be building analyst and press relationships that reduce CAC long-term." });
  }

  return phases;
}

// Accountability gap analysis
function getGaps(inputs) {
  const gaps = [];
  const { existing, motion, stage, pipelineOwner, websiteOwner, enablementOwner, contentOwner, customerMktgOwner } = inputs;

  if (!existing.revenue_ops) gaps.push({ severity: "critical", zone: "Pipeline Visibility", gap: "No RevOps function", detail: "Without a dedicated RevOps or commercial operations function, pipeline data lives in spreadsheets and tribal knowledge. Forecast accuracy will be poor, attribution will be guesswork, and the CRM will degrade over time.", fix: "Stand up RevOps first. Even a single analyst with clear ownership of CRM governance and weekly reporting changes the quality of commercial decision-making overnight." });

  if (!existing.product_marketing) gaps.push({ severity: "critical", zone: "Positioning & Messaging", gap: "No Product Marketing function", detail: "Without PMM, positioning decisions get made by whoever talks to customers most — usually the founder or top AE. This means every rep tells a different story, competitive responses are ad hoc, and launches generate activity rather than pipeline.", fix: "Hire a PMM before your next AE. One strong PMM typically improves rep productivity more than a new sales hire by giving the existing team a better message to carry." });

  if ((motion === "sales_led" || motion === "hybrid") && !existing.enablement) gaps.push({ severity: "high", zone: "Rep Productivity", gap: "No Sales Enablement function", detail: "In a sales-led motion without enablement, onboarding is informal, playbooks don't exist or aren't followed, and institutional knowledge walks out the door every time a rep leaves. Ramp time is longer than it should be.", fix: "Enablement doesn't need to be a large team. One strong enablement hire with ownership of onboarding, a single playbook, and a win/loss process will measurably improve ramp time within two quarters." });

  if (pipelineOwner === "marketing_only") gaps.push({ severity: "high", zone: "Pipeline Accountability", gap: "Marketing owns pipeline but not revenue", detail: "Marketing optimizing for MQLs without a shared revenue outcome creates a permanent misalignment with sales. Marketing will optimize for volume; sales will ignore the leads. The gap between MQL and closed revenue belongs to nobody.", fix: "Create a shared pipeline contribution metric — not MQLs, not revenue, but qualified pipeline created by marketing-sourced activity. Align both functions to it with a monthly joint review." });

  if (pipelineOwner === "sales_only") gaps.push({ severity: "medium", zone: "Pipeline Accountability", gap: "Sales owns pipeline with no marketing contribution target", detail: "When sales owns all pipeline generation, marketing becomes a support function rather than a revenue driver. This is sustainable at early stages but creates a scaling problem — SDR cost per pipeline dollar is significantly higher than inbound-assisted pipeline.", fix: "Define a marketing pipeline contribution target — even 20–30% of pipeline sourced or influenced by marketing changes how the function prioritizes its work and investment." });

  if (websiteOwner === "it") gaps.push({ severity: "high", zone: "Digital & Conversion", gap: "Website owned by IT, not marketing", detail: "When the website is an IT asset, conversion optimization, messaging updates, and A/B testing require tickets and sprint cycles. The commercial team loses the ability to respond to market signals in real time.", fix: "Move website ownership to marketing or digital. IT retains infrastructure responsibility; commercial owns the experience, content, and conversion architecture." });

  if (!existing.customer_marketing && (stage === "growth" || stage === "scale" || stage === "pe_portfolio")) gaps.push({ severity: "medium", zone: "Expansion Revenue", gap: "No Customer Marketing function", detail: "At your stage, expansion revenue should be a significant portion of new ARR. Without a function that owns advocacy, references, and customer pipeline, you're leaving expansion revenue to chance and individual CSM initiative.", fix: "Start with a customer marketing manager who owns: reference program, expansion content, customer community (if applicable), and a pipeline contribution goal from the existing customer base." });

  if (contentOwner === "agency_only") gaps.push({ severity: "medium", zone: "Content & Narrative", gap: "Content fully outsourced to agency", detail: "Agencies produce content that sounds like marketing. The best-performing B2B content sounds like a practitioner. Original thinking, specific data, and strong POVs can't be reliably outsourced — they require someone who understands the business deeply.", fix: "Hire one strong content lead internally before expanding agency spend. Their job is original POV content and editorial strategy. Use agency for production, not for ideas." });

  if (!existing.revenue_ops && existing.enablement) gaps.push({ severity: "medium", zone: "Data & Measurement", gap: "Enablement without RevOps creates unmeasured investment", detail: "Sales enablement investment is notoriously hard to measure without clean pipeline and rep performance data. Without RevOps, you can't reliably attribute productivity gains to enablement programs.", fix: "Stand up basic RevOps reporting before scaling enablement investment. Even a simple rep-level performance dashboard changes how enablement prioritizes its programs." });

  if (enablementOwner === "hr") gaps.push({ severity: "medium", zone: "Sales Productivity", gap: "Enablement reporting into HR", detail: "Enablement owned by HR optimizes for training completion and satisfaction scores, not rep productivity and revenue impact. It becomes a compliance function rather than a commercial one.", fix: "Move enablement into the revenue org — reporting to CRO or VP Sales. Redefine success metrics as ramp time, quota attainment rate, and win rate improvement, not training hours completed." });

  return gaps.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2 };
    return order[a.severity] - order[b.severity];
  });
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function SegBtn({ options, value, onChange, small }) {
  return (
    <div style={{ display: "flex", gap: 1, background: "#0a0e14", borderRadius: 6, padding: 2, flexWrap: "wrap" }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)} style={{
          flex: 1, minWidth: small ? 60 : 80, padding: small ? "7px 8px" : "9px 8px",
          background: value === opt.value ? "#1e293b" : "transparent",
          border: "none", borderRadius: 5, cursor: "pointer",
          fontFamily: "'DM Mono', monospace", fontSize: 10,
          letterSpacing: "0.04em", textTransform: "uppercase",
          color: value === opt.value ? "#e2e8f0" : "#475569",
          transition: "all 0.15s", lineHeight: 1.3, textAlign: "center"
        }}>
          <div style={{ fontWeight: 600 }}>{opt.label}</div>
          {opt.sub && <div style={{ fontSize: 9, opacity: 0.6, marginTop: 2 }}>{opt.sub}</div>}
        </button>
      ))}
    </div>
  );
}

function Toggle({ label, checked, onChange, color }) {
  return (
    <div onClick={() => onChange(!checked)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "8px 0" }}>
      <div style={{
        width: 36, height: 20, borderRadius: 10, background: checked ? color : "#1e293b",
        position: "relative", transition: "background 0.2s", flexShrink: 0
      }}>
        <div style={{
          width: 14, height: 14, borderRadius: "50%", background: "white",
          position: "absolute", top: 3, left: checked ? 19 : 3,
          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
        }} />
      </div>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: checked ? "#e2e8f0" : "#475569" }}>{label}</span>
    </div>
  );
}

function FunctionPill({ fnKey, small }) {
  const fn = FUNCTIONS[fnKey];
  if (!fn) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: fn.color + "18", border: `1px solid ${fn.color}44`,
      borderRadius: 5, padding: small ? "3px 8px" : "5px 10px",
      fontFamily: "'DM Mono', monospace", fontSize: small ? 10 : 11,
      color: fn.color, whiteSpace: "nowrap"
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: fn.color, flexShrink: 0 }} />
      {small ? fn.short : fn.label}
    </span>
  );
}

function GapCard({ gap }) {
  const severityColor = { critical: "#ef4444", high: "#f97316", medium: "#f59e0b" };
  const color = severityColor[gap.severity];
  return (
    <div style={{ background: "#0a0e14", border: `1px solid ${color}22`, borderLeft: `3px solid ${color}`, borderRadius: 8, padding: "16px 18px", marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700, color }}>{gap.gap}</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: color + "88", border: `1px solid ${color}33`, borderRadius: 3, padding: "2px 6px" }}>{gap.severity}</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#334155", marginLeft: "auto" }}>{gap.zone}</span>
      </div>
      <p style={{ margin: "0 0 10px", fontSize: 13, color: "#94a3b8", lineHeight: 1.65 }}>{gap.detail}</p>
      <div style={{ background: "#080c10", borderRadius: 6, padding: "10px 12px" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#334155" }}>Fix → </span>
        <span style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{gap.fix}</span>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const defaultInputs = {
  stage: "growth",
  motion: "sales_led",
  existing: {
    demand: false, content: false, product_marketing: false,
    enablement: false, digital: false, creative: false,
    customer_marketing: false, revenue_ops: false,
    partnerships: false, comms: false,
  },
  pipelineOwner: "shared",
  websiteOwner: "marketing",
  enablementOwner: "sales",
  contentOwner: "internal",
  customerMktgOwner: "cs",
};

export default function GTMOrgDesigner() {
  const [inputs, setInputs] = useState(defaultInputs);
  const [mode, setMode] = useState("builder");
  const [expandedPhase, setExpandedPhase] = useState(0);

  const set = (key, val) => setInputs(p => ({ ...p, [key]: val }));
  const setExisting = (key, val) => setInputs(p => ({ ...p, existing: { ...p.existing, [key]: val } }));

  const buildSequence = getBuildSequence(inputs.stage, inputs.motion, inputs.existing);
  const gaps = getGaps(inputs);
  const criticalGaps = gaps.filter(g => g.severity === "critical").length;
  const highGaps = gaps.filter(g => g.severity === "high").length;

  const T = {
    headerBg: "#0f172a", headerBorder: "#1e293b",
    pageBg: "#f8f9fb", cardBg: "#ffffff", cardBorder: "#e5e7eb",
    textPrimary: "#111827", textSecondary: "#374151",
    textMuted: "#6b7280", textFaint: "#9ca3af",
    accent: "#1a6b3c", accentLight: "#f0fdf4",
    accentBorder: "#bbf7d0", accentText: "#166534",
    success: "#16a34a", successLight: "#f0fdf4", successBorder: "#bbf7d0",
    warning: "#d97706", warningLight: "#fffbeb", warningBorder: "#fde68a",
    danger: "#dc2626", dangerLight: "#fef2f2", dangerBorder: "#fecaca",
    orange: "#ea580c", orangeLight: "#fff7ed", orangeBorder: "#fed7aa",
    mono: "'DM Mono', monospace", sans: "'Inter', sans-serif",
  };

  const severityColors = { critical: T.danger, high: T.orange, medium: T.warning };

  function SegBtn({ options, value, onChange }) {
    return (
      <div style={{ display: "flex", gap: 1, background: T.cardBorder, borderRadius: 7, padding: 2, flexWrap: "wrap" }}>
        {options.map(opt => (
          <button key={opt.value} onClick={() => onChange(opt.value)} style={{
            flex: 1, minWidth: 60, padding: "7px 5px",
            background: value === opt.value ? T.headerBg : T.cardBg,
            border: "none", borderRadius: 5, cursor: "pointer",
            fontFamily: T.mono, fontSize: 10, letterSpacing: "0.04em", textTransform: "uppercase",
            color: value === opt.value ? "#e2e8f0" : T.textMuted,
            transition: "all 0.15s", lineHeight: 1.3, textAlign: "center"
          }}>
            <div style={{ fontWeight: 600 }}>{opt.label}</div>
            {opt.sub && <div style={{ fontSize: 9, opacity: 0.6, marginTop: 1 }}>{opt.sub}</div>}
          </button>
        ))}
      </div>
    );
  }

  function Toggle({ label, checked, onChange }) {
    return (
      <div onClick={() => onChange(!checked)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "7px 0" }}>
        <div style={{ width: 34, height: 18, borderRadius: 9, background: checked ? T.accent : "#d1d5db", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: checked ? 19 : 3, transition: "left 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
        </div>
        <span style={{ fontFamily: T.sans, fontSize: 13, color: checked ? T.textPrimary : T.textMuted }}>{label}</span>
      </div>
    );
  }

  function FunctionPill({ fnKey, small }) {
    const fn = FUNCTIONS[fnKey];
    if (!fn) return null;
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: T.accentLight, border: `1px solid ${T.accentBorder}`,
        borderRadius: 5, padding: small ? "3px 8px" : "5px 10px",
        fontFamily: T.mono, fontSize: small ? 10 : 11,
        color: T.accentText, whiteSpace: "nowrap"
      }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.accent, flexShrink: 0 }} />
        {small ? fn.short : fn.label}
      </span>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.pageBg, fontFamily: T.sans, color: T.textPrimary }}>
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(5px);  } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
      \`}</style>

      <div style={{ background: T.headerBg, padding: "20px 40px", borderBottom: `1px solid ${T.headerBorder}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: T.accent, marginBottom: 5 }}>GTM Architecture · Org Design</div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>GTM Org Designer</h1>
            <p style={{ margin: "3px 0 0", color: "#64748b", fontSize: 13 }}>Build a commercial org from scratch, or diagnose what's broken in the one you have.</p>
          </div>
          <div style={{ display: "flex", gap: 1, background: T.headerBorder, borderRadius: 7, padding: 2 }}>
            {[{ key: "builder", label: "Builder" }, { key: "diagnostic", label: `Diagnostic${gaps.length > 0 ? ` (${gaps.length})` : ""}` }].map(m => (
              <button key={m.key} onClick={() => setMode(m.key)} style={{
                padding: "8px 18px", background: mode === m.key ? "#1e293b" : "transparent",
                border: "none", borderRadius: 5, cursor: "pointer",
                fontFamily: T.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
                color: mode === m.key ? "#e2e8f0" : "#475569", transition: "all 0.15s", fontWeight: mode === m.key ? 600 : 400
              }}>{m.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "32px 40px 80px", display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>

        <div style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${T.cardBorder}` }}>Parameters</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, marginBottom: 8 }}>Company Stage</div>
              <SegBtn options={STAGES} value={inputs.stage} onChange={v => set("stage", v)} />
            </div>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, marginBottom: 8 }}>GTM Motion</div>
              <SegBtn options={MOTIONS} value={inputs.motion} onChange={v => set("motion", v)} />
            </div>
          </div>

          <div style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${T.cardBorder}` }}>
              Functions You Have
              <span style={{ color: T.textFaint, marginLeft: 8 }}>{Object.values(inputs.existing).filter(Boolean).length}/{Object.keys(inputs.existing).length}</span>
            </div>
            {Object.entries(FUNCTIONS).map(([key, fn]) => (
              <Toggle key={key} label={fn.short} checked={inputs.existing[key]} onChange={v => setExisting(key, v)} />
            ))}
          </div>

          <div style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${T.cardBorder}` }}>Ownership Model</div>
            {[
              { key: "pipelineOwner", label: "Pipeline owned by", options: [{ value: "marketing_only", label: "Mktg" }, { value: "sales_only", label: "Sales" }, { value: "shared", label: "Shared" }] },
              { key: "websiteOwner",  label: "Website owned by", options: [{ value: "marketing", label: "Mktg" }, { value: "it", label: "IT" }, { value: "shared", label: "Shared" }] },
              { key: "enablementOwner", label: "Enablement reports to", options: [{ value: "sales", label: "Sales" }, { value: "hr", label: "HR" }, { value: "none", label: "None" }] },
              { key: "contentOwner", label: "Content produced by", options: [{ value: "internal", label: "Internal" }, { value: "agency_only", label: "Agency" }, { value: "mixed", label: "Mixed" }] },
            ].map(item => (
              <div key={item.key} style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textFaint, marginBottom: 6 }}>{item.label}</div>
                <SegBtn options={item.options} value={inputs[item.key]} onChange={v => set(item.key, v)} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ animation: "slideIn 0.3s ease" }} key={mode}>

          {mode === "builder" && (
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: 16 }}>
                Build Sequence · {STAGES.find(s => s.value === inputs.stage)?.label} · {MOTIONS.find(m => m.value === inputs.motion)?.label}
              </div>

              {buildSequence.map((phase, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div onClick={() => setExpandedPhase(expandedPhase === i ? -1 : i)} style={{
                    background: T.cardBg,
                    border: `1px solid ${expandedPhase === i ? T.accentBorder : T.cardBorder}`,
                    borderLeft: `3px solid ${T.accent}`,
                    borderRadius: expandedPhase === i ? "8px 8px 0 0" : 8,
                    padding: "14px 18px", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                  }}>
                    <div>
                      <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.accent, marginBottom: 6 }}>{phase.label}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {phase.functions.map(fn => <FunctionPill key={fn} fnKey={fn} small />)}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, marginLeft: 16 }}>
                      <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textFaint }}>{phase.timing}</span>
                      <span style={{ color: T.textFaint, fontSize: 12 }}>{expandedPhase === i ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {expandedPhase === i && (
                    <div style={{ background: T.accentLight, border: `1px solid ${T.accentBorder}`, borderTop: "none", borderRadius: "0 0 8px 8px", padding: "16px 18px 20px" }}>
                      <p style={{ margin: "0 0 18px", fontSize: 13, color: T.accentText, lineHeight: 1.7 }}>{phase.rationale}</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {phase.functions.map(fnKey => {
                          const fn = FUNCTIONS[fnKey];
                          return (
                            <div key={fnKey} style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 7, padding: "12px 14px" }}>
                              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.accent, fontWeight: 600, marginBottom: 6 }}>{fn.label}</div>
                              <div style={{ marginBottom: 3 }}>
                                <span style={{ fontFamily: T.mono, fontSize: 9, color: T.textFaint, textTransform: "uppercase", letterSpacing: "0.06em" }}>Owns → </span>
                                <span style={{ fontSize: 12, color: T.textMuted }}>{fn.owns}</span>
                              </div>
                              <div>
                                <span style={{ fontFamily: T.mono, fontSize: 9, color: T.textFaint, textTransform: "uppercase", letterSpacing: "0.06em" }}>Reports to → </span>
                                <span style={{ fontSize: 12, color: T.textMuted }}>{fn.reports}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div style={{ marginTop: 20, background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, marginBottom: 14 }}>All Functions — Ownership Reference</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {Object.entries(FUNCTIONS).map(([key, fn]) => (
                    <div key={key} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, flexShrink: 0, marginTop: 5 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary }}>{fn.short}</div>
                        <div style={{ fontSize: 11, color: T.textFaint, lineHeight: 1.4, marginTop: 2 }}>{fn.reports}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mode === "diagnostic" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Critical Gaps",      value: criticalGaps, color: T.danger  },
                  { label: "High-Severity Gaps", value: highGaps,     color: T.orange  },
                  { label: "Total Issues",        value: gaps.length,  color: T.warning },
                ].map(m => (
                  <div key={m.label} style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderTop: `3px solid ${m.value > 0 ? m.color : T.cardBorder}`, borderRadius: 8, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: m.value > 0 ? m.color : T.textFaint, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 700, color: m.value > 0 ? m.color : T.textFaint, lineHeight: 1 }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {gaps.length === 0 && (
                <div style={{ background: T.successLight, border: `1px solid ${T.successBorder}`, borderRadius: 10, padding: "32px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>◆</div>
                  <div style={{ fontFamily: T.mono, fontSize: 13, color: T.success, marginBottom: 8 }}>No significant gaps detected</div>
                  <p style={{ margin: 0, fontSize: 13, color: T.textMuted, lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>Based on the functions and ownership model you've indicated, the structure looks solid for your stage and motion.</p>
                </div>
              )}

              {gaps.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: 14 }}>Accountability Gaps — sorted by severity</div>
                  {gaps.map((gap, i) => {
                    const color = severityColors[gap.severity];
                    return (
                      <div key={i} style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderLeft: `3px solid ${color}`, borderRadius: 8, padding: "16px 18px", marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color }}>{gap.gap}</span>
                          <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color, opacity: 0.7 }}>{gap.severity}</span>
                          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.textFaint, marginLeft: "auto" }}>{gap.zone}</span>
                        </div>
                        <p style={{ margin: "0 0 10px", fontSize: 13, color: T.textSecondary, lineHeight: 1.65 }}>{gap.detail}</p>
                        <div style={{ background: T.pageBg, border: `1px solid ${T.cardBorder}`, borderRadius: 6, padding: "10px 12px" }}>
                          <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textFaint }}>Fix → </span>
                          <span style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6 }}>{gap.fix}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: 14 }}>Function Coverage</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                  {Object.entries(FUNCTIONS).map(([key, fn]) => {
                    const has = inputs.existing[key];
                    return (
                      <div key={key} style={{ background: has ? T.accentLight : T.pageBg, border: `1px solid ${has ? T.accentBorder : T.cardBorder}`, borderRadius: 6, padding: "10px 8px", textAlign: "center", opacity: has ? 1 : 0.5 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: has ? T.accent : "#d1d5db", margin: "0 auto 6px" }} />
                        <div style={{ fontFamily: T.mono, fontSize: 9, color: has ? T.accentText : T.textFaint, lineHeight: 1.3 }}>{fn.short}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: T.accent }} /><span style={{ fontFamily: T.mono, fontSize: 10, color: T.textMuted }}>Present</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#d1d5db" }} /><span style={{ fontFamily: T.mono, fontSize: 10, color: T.textFaint }}>Missing</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
