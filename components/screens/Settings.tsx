"use client";

import { FONT, T } from "@/lib/tokens";
import { ScreenBody, BackRow } from "@/components/screens/Frame";
import { useApp } from "@/store/useApp";

export function Settings() {
  const go = useApp((s) => s.go);
  const currentUser = useApp((s) => s.currentUser);
  const signOut = useApp((s) => s.signOut);
  const apiKey = useApp((s) => s.apiKey);
  const model = useApp((s) => s.model);
  const serverHasKey = useApp((s) => s.serverHasKey);
  const aiActive = !!apiKey || serverHasKey;
  const prefs = useApp((s) => s.prefs);
  const sessions = useApp((s) => s.sessions);
  const setApiKey = useApp((s) => s.setApiKey);
  const setModel = useApp((s) => s.setModel);
  const setPref = useApp((s) => s.setPref);
  const resetData = useApp((s) => s.resetData);

  const totalSets = sessions.reduce((a, s) => a + s.entries.reduce((b, e) => b + e.sets.length, 0), 0);

  return (
    <ScreenBody>
      <BackRow left="‹ HOME" right="SETTINGS" onBack={() => go("home")} />

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* ACCOUNT */}
        <Section title="ACCOUNT">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 1.5, color: T.sub }}>SIGNED IN AS</div>
              <div style={{ font: `400 28px/1 ${FONT.anton}`, textTransform: "uppercase", marginTop: 6 }}>
                {currentUser?.name ?? "—"}
              </div>
            </div>
            <span style={{ font: `700 9px/1 ${FONT.mono}`, letterSpacing: 1, color: T.sub, textAlign: "right" }}>
              CLOUD
              <br />
              SYNCED
            </span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => go("login")}
              style={{
                flex: 1,
                border: `2px solid ${T.ink}`,
                background: "transparent",
                color: T.ink,
                padding: 14,
                font: `700 12px/1 ${FONT.mono}`,
                letterSpacing: 1,
                cursor: "pointer",
              }}
            >
              SWITCH USER
            </button>
            <button
              onClick={signOut}
              style={{
                flex: 1,
                border: `2px solid ${T.line}`,
                background: "transparent",
                color: T.sub,
                padding: 14,
                font: `700 12px/1 ${FONT.mono}`,
                letterSpacing: 1,
                cursor: "pointer",
              }}
            >
              SIGN OUT
            </button>
          </div>
        </Section>

        {/* COACH AI */}
        <Section title="COACH AI">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ font: `700 11px/1 ${FONT.mono}`, letterSpacing: 1, color: T.sub }}>STATUS</span>
            <span
              style={{
                font: `700 10px/1 ${FONT.mono}`,
                letterSpacing: 1,
                color: aiActive ? "#fff" : T.sub,
                background: aiActive ? T.accent : "transparent",
                border: aiActive ? "none" : `1.5px solid ${T.line}`,
                padding: "5px 8px",
              }}
            >
              {aiActive ? "● LIVE AI" : "○ OFFLINE COACH"}
            </span>
          </div>
          <Field label="OPENROUTER API KEY">
            <input
              className="mxin"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-…"
              style={input}
              autoComplete="off"
              spellCheck={false}
            />
          </Field>
          <Field label="MODEL">
            <input
              className="mxin"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="anthropic/claude-sonnet-4.6"
              style={input}
              spellCheck={false}
            />
          </Field>
          <p style={note}>
            {serverHasKey && !apiKey
              ? "Live AI is enabled on this deployment. You can override the model below, or paste your own openrouter.ai key — stored only on this device."
              : "Without a key the coach still builds real plans on-device from your history. Add an openrouter.ai key for live AI — stored only on this device."}
          </p>
        </Section>

        {/* ATHLETE PROFILE */}
        <Section title="ATHLETE PROFILE">
          <Field label="GOAL">
            <input className="mxin" value={prefs.goal} onChange={(e) => setPref("goal", e.target.value)} style={input} />
          </Field>
          <Field label="EQUIPMENT">
            <input className="mxin" value={prefs.equipment} onChange={(e) => setPref("equipment", e.target.value)} style={input} />
          </Field>
          <Field label="SPLIT STYLE">
            <input className="mxin" value={prefs.split_style} onChange={(e) => setPref("split_style", e.target.value)} style={input} />
          </Field>
          <Field label="DEFAULT REST (SECONDS)">
            <input
              className="mxin"
              type="number"
              inputMode="numeric"
              min={0}
              step={5}
              value={prefs.rest_default}
              onChange={(e) => setPref("rest_default", Math.max(0, Number(e.target.value) || 0))}
              style={input}
            />
          </Field>
        </Section>

        {/* DATA */}
        <Section title="DATA" last>
          <div style={{ font: `700 11px/1.6 ${FONT.mono}`, color: T.sub, letterSpacing: 1, marginBottom: 14 }}>
            {sessions.length} SESSIONS · {totalSets} SETS LOGGED · STORED ON-DEVICE
          </div>
          <button
            onClick={() => {
              if (confirm("Clear all logged sessions, PBs and preferences? This cannot be undone.")) resetData();
            }}
            style={{
              width: "100%",
              border: `2px solid ${T.accent}`,
              background: "transparent",
              color: T.accent,
              padding: 16,
              font: `700 13px/1 ${FONT.mono}`,
              letterSpacing: 1.5,
              cursor: "pointer",
            }}
          >
            RESET ALL DATA
          </button>
        </Section>
      </div>
    </ScreenBody>
  );
}

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ padding: "18px 22px", borderBottom: last ? "none" : `2px solid ${T.ink}` }}>
      <div style={{ font: `400 26px/1 ${FONT.anton}`, textTransform: "uppercase", letterSpacing: -0.3, marginBottom: 16 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 1.5, color: T.sub, marginBottom: 7 }}>{label}</div>
      {children}
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  border: `2px solid ${T.line}`,
  background: "transparent",
  outline: "none",
  font: `700 13px/1.2 ${FONT.mono}`,
  letterSpacing: 0.5,
  color: T.ink,
  padding: "12px 12px",
};

const note: React.CSSProperties = {
  font: `400 12px/1.6 ${FONT.archivo}`,
  color: T.sub,
  margin: "2px 0 0",
};
