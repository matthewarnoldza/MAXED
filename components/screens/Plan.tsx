"use client";

import { FONT, T } from "@/lib/tokens";
import { ScreenBody, BackRow } from "@/components/screens/Frame";
import { ChevronUp, ChevronDown } from "@/components/ui/icons";
import { useApp } from "@/store/useApp";

export function Plan() {
  const go = useApp((s) => s.go);
  const plan = useApp((s) => s.plan);
  const move = useApp((s) => s.movePlan);

  const planSets = plan.reduce((a, b) => a + b.sets, 0);

  return (
    <ScreenBody>
      <BackRow left="‹ HOME" right="PLAN" onBack={() => go("home")} />

      <div style={{ padding: "14px 22px 16px", borderBottom: `2px solid ${T.ink}` }}>
        <div style={{ font: `400 40px/.9 ${FONT.anton}`, textTransform: "uppercase", letterSpacing: -0.5 }}>
          Squat Day
        </div>
        <div style={{ font: `700 11px/1 ${FONT.mono}`, letterSpacing: 1.5, color: T.sub, marginTop: 10 }}>
          {plan.length} LIFTS · {planSets} SETS · ~45 MIN
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {plan.map((row, i) => (
          <div
            key={row.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 22px",
              borderBottom: `1px solid ${T.line}`,
            }}
          >
            <span style={{ font: `400 22px/1 ${FONT.anton}`, color: T.sub, width: 34 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: `700 17px/1.1 ${FONT.archivo}` }}>{row.name}</div>
              <div style={{ font: `700 11px/1 ${FONT.mono}`, letterSpacing: 1, color: T.sub, marginTop: 5 }}>
                {row.sets} × {row.reps} · {row.kg}KG
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <ReorderBtn label="Move up" onClick={() => move(i, -1)} top>
                <ChevronUp />
              </ReorderBtn>
              <ReorderBtn label="Move down" onClick={() => move(i, 1)}>
                <ChevronDown />
              </ReorderBtn>
            </div>
          </div>
        ))}

        <button
          onClick={() => go("library")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 22px",
            width: "100%",
            border: "none",
            background: "transparent",
            color: T.sub,
            cursor: "pointer",
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              border: `2px dashed ${T.line}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              font: `400 22px/1 ${FONT.anton}`,
              color: T.sub,
            }}
          >
            +
          </span>
          <span style={{ font: `700 12px/1 ${FONT.mono}`, letterSpacing: 1 }}>ADD FROM LIBRARY</span>
        </button>
      </div>

      <div style={{ padding: "12px 22px 0", display: "flex", gap: 10 }}>
        <button
          onClick={() => go("library")}
          style={{
            flex: "none",
            width: 96,
            border: `2px solid ${T.ink}`,
            background: "transparent",
            color: T.ink,
            padding: "20px 0",
            font: `700 13px/1 ${FONT.mono}`,
            letterSpacing: 1,
            cursor: "pointer",
          }}
        >
          EDIT
        </button>
        <button
          onClick={() => go("logger")}
          style={{
            flex: 1,
            border: "none",
            background: T.accent,
            color: "#fff",
            padding: 20,
            font: `400 26px/1 ${FONT.anton}`,
            letterSpacing: 1,
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Start ▶
        </button>
      </div>
    </ScreenBody>
  );
}

function ReorderBtn({
  children,
  onClick,
  label,
  top,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  top?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 34,
        height: 26,
        border: `1.5px solid ${T.line}`,
        borderBottom: top ? "none" : `1.5px solid ${T.line}`,
        background: "transparent",
        color: T.ink,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}
