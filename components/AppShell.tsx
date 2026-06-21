"use client";

import { useEffect, useRef } from "react";
import { Phone } from "@/components/Phone";
import { Launch } from "@/components/screens/Launch";
import { Login } from "@/components/screens/Login";
import { Home } from "@/components/screens/Home";
import { Plan } from "@/components/screens/Plan";
import { Library } from "@/components/screens/Library";
import { Assistant } from "@/components/screens/Assistant";
import { SetLogger } from "@/components/screens/SetLogger";
import { History } from "@/components/screens/History";
import { Settings } from "@/components/screens/Settings";
import { SessionLog } from "@/components/screens/SessionLog";
import { useApp, cloudData, cacheUser, cloudPost, type ScreenId } from "@/store/useApp";

const SCREENS: Record<ScreenId, React.ComponentType> = {
  launch: Launch,
  login: Login,
  home: Home,
  plan: Plan,
  library: Library,
  assistant: Assistant,
  logger: SetLogger,
  history: History,
  sessions: SessionLog,
  settings: Settings,
};

export function AppShell() {
  const screen = useApp((s) => s.screen);
  const theme = useApp((s) => s.theme);
  const currentUser = useApp((s) => s.currentUser);
  const loadingUser = useApp((s) => s.loadingUser);
  const cloudOk = useApp((s) => s.cloudOk);
  const tickRest = useApp((s) => s.tickRest);

  const lastCloud = useRef("");
  const lastId = useRef<string | null>(null);

  // restore device state, then load the signed-in user's data from the cloud
  useEffect(() => {
    useApp.getState().checkServerKey(); // honest "live AI" vs "offline coach" labels
    Promise.resolve(useApp.persist.rehydrate()).then(async () => {
      const st = useApp.getState();
      if (st.currentUser) await st.loadUser(st.currentUser.id, st.currentUser.name);
      useApp.setState({ hydrated: true });
    });
  }, []);

  // global 1s rest-timer tick
  useEffect(() => {
    const id = setInterval(() => tickRest(), 1000);
    return () => clearInterval(id);
  }, [tickRest]);

  // sync per-user data → on-device cache (always) + cloud (when the durable doc changes)
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const flush = (immediate: boolean) => {
      const s = useApp.getState();
      if (!s.hydrated || s.loadingUser || !s.currentUser) return;
      if (lastId.current !== s.currentUser.id) {
        lastId.current = s.currentUser.id;
        lastCloud.current = "";
      }
      cacheUser(s);
      const cloud = JSON.stringify(cloudData(s));
      if (cloud === lastCloud.current) return;
      lastCloud.current = cloud;
      cloudPost(s.currentUser.id, s.currentUser.name, cloudData(s), { beacon: immediate });
    };
    const unsub = useApp.subscribe(() => {
      clearTimeout(t);
      t = setTimeout(() => flush(false), 700);
    });
    const onHide = () => flush(true);
    window.addEventListener("pagehide", onHide);
    const onVis = () => {
      if (document.visibilityState === "hidden") onHide();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearTimeout(t);
      unsub();
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const Active: React.ComponentType = screen === "launch" ? Launch : !currentUser ? Login : SCREENS[screen];

  return (
    <div data-mx-theme={theme} style={{ minHeight: "100dvh" }}>
      <Phone>
        <Active />
        {currentUser && (loadingUser || !cloudOk) && <SyncPill loading={loadingUser} />}
      </Phone>
    </div>
  );
}

/** Tiny non-blocking indicator: data loading, or a failed cloud save that will retry. */
function SyncPill({ loading }: { loading: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 54,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 70,
        pointerEvents: "none",
        background: "var(--mx-bg)",
        border: "1.5px solid var(--mx-line)",
        color: "var(--mx-sub)",
        font: "700 10px/1 var(--font-mono)",
        letterSpacing: 1,
        padding: "6px 12px",
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        gap: 7,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: loading ? "var(--mx-sub)" : "var(--mx-accent)",
          animation: "glowpulse 1s infinite",
        }}
      />
      {loading ? "SYNCING…" : "OFFLINE · WILL RETRY"}
    </div>
  );
}
