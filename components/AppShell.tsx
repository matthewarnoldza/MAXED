"use client";

import { useEffect } from "react";
import { Phone } from "@/components/Phone";
import { Launch } from "@/components/screens/Launch";
import { Home } from "@/components/screens/Home";
import { Plan } from "@/components/screens/Plan";
import { Library } from "@/components/screens/Library";
import { Assistant } from "@/components/screens/Assistant";
import { SetLogger } from "@/components/screens/SetLogger";
import { History } from "@/components/screens/History";
import { useApp, type ScreenId } from "@/store/useApp";

const SCREENS: Record<ScreenId, React.ComponentType> = {
  launch: Launch,
  home: Home,
  plan: Plan,
  library: Library,
  assistant: Assistant,
  logger: SetLogger,
  history: History,
};

export function AppShell() {
  const screen = useApp((s) => s.screen);
  const theme = useApp((s) => s.theme);
  const hydrate = useApp((s) => s.hydrate);
  const tickRest = useApp((s) => s.tickRest);

  // restore persisted theme once on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // global 1s rest-timer tick
  useEffect(() => {
    const id = setInterval(() => tickRest(), 1000);
    return () => clearInterval(id);
  }, [tickRest]);

  const Screen = SCREENS[screen];

  return (
    <div data-mx-theme={theme} style={{ minHeight: "100dvh" }}>
      <Phone>
        <Screen />
      </Phone>
    </div>
  );
}
