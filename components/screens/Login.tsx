"use client";

import { useState } from "react";
import { FONT, T } from "@/lib/tokens";
import { OverloadArrow, PlayTriangle } from "@/components/ui/icons";
import { useApp } from "@/store/useApp";

export function Login() {
  const profiles = useApp((s) => s.knownProfiles);
  const switchUser = useApp((s) => s.switchUser);
  const createProfile = useApp((s) => s.createProfile);
  const removeProfile = useApp((s) => s.removeProfile);

  const [adding, setAdding] = useState(profiles.length === 0);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    const clean = name.trim();
    if (!clean || busy) return;
    setBusy(true);
    await createProfile(clean);
    setBusy(false);
    setName("");
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "calc(env(safe-area-inset-top, 0px) + 40px) 28px calc(env(safe-area-inset-bottom, 0px) + 30px)",
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT.archivo,
        color: T.ink,
        background: T.bg,
        overflow: "hidden",
        animation: "screenIn .28s ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", marginTop: 10 }}>
        <div style={{ font: `400 46px/.82 ${FONT.anton}`, letterSpacing: -2, textTransform: "uppercase" }}>Maxed</div>
        <OverloadArrow w={9} h={16} ml={5} mt={2} />
      </div>
      <div style={{ textAlign: "center", font: `700 11px/1 ${FONT.mono}`, letterSpacing: 4, color: T.accent, marginTop: 14 }}>
        WHO&apos;S TRAINING?
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", marginTop: 34, display: "flex", flexDirection: "column", gap: 12 }}>
        {profiles.map((p) => (
          <div key={p.id} style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => switchUser(p.id)}
              style={{
                flex: 1,
                textAlign: "left",
                border: `2px solid ${T.ink}`,
                background: "transparent",
                color: T.ink,
                padding: "20px 22px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ font: `400 30px/1 ${FONT.anton}`, textTransform: "uppercase", letterSpacing: -0.5 }}>{p.name}</span>
              <PlayTriangle s={16} color={T.accent} />
            </button>
            <button
              onClick={() => removeProfile(p.id)}
              aria-label={`Forget ${p.name} on this device`}
              title="Forget on this device"
              style={{
                flex: "none",
                width: 52,
                border: `2px solid ${T.line}`,
                background: "transparent",
                color: T.sub,
                font: `400 22px/1 ${FONT.anton}`,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        ))}

        {adding ? (
          <div style={{ border: `2px solid ${T.accent}`, padding: 14, marginTop: profiles.length ? 6 : 0 }}>
            <div style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 1.5, color: T.sub, marginBottom: 9 }}>NEW PERSON</div>
            <input
              className="mxin"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
              placeholder="YOUR NAME"
              maxLength={40}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                font: `400 30px/1.1 ${FONT.anton}`,
                color: T.ink,
                width: "100%",
                textTransform: "uppercase",
              }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              {profiles.length > 0 && (
                <button
                  onClick={() => {
                    setAdding(false);
                    setName("");
                  }}
                  style={{
                    flex: "none",
                    width: 96,
                    border: `2px solid ${T.line}`,
                    background: "transparent",
                    color: T.sub,
                    padding: "14px 0",
                    font: `700 12px/1 ${FONT.mono}`,
                    letterSpacing: 1,
                    cursor: "pointer",
                  }}
                >
                  CANCEL
                </button>
              )}
              <button
                onClick={create}
                disabled={!name.trim() || busy}
                style={{
                  flex: 1,
                  border: "none",
                  background: name.trim() ? T.accent : T.line,
                  color: "#fff",
                  padding: 16,
                  font: `400 24px/1 ${FONT.anton}`,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  cursor: name.trim() && !busy ? "pointer" : "default",
                }}
              >
                {busy ? "…" : "Start training"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              border: `2px dashed ${T.line}`,
              background: "transparent",
              color: T.sub,
              padding: "18px 22px",
              font: `700 12px/1 ${FONT.mono}`,
              letterSpacing: 1.5,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            + ADD PERSON
          </button>
        )}
      </div>

      <div style={{ textAlign: "center", font: `700 9px/1.5 ${FONT.mono}`, letterSpacing: 1, color: T.sub, marginTop: 18, opacity: 0.7 }}>
        EACH PROFILE KEEPS ITS OWN HISTORY · SYNCED TO THE CLOUD
      </div>
    </div>
  );
}
