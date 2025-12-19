// src/components/dccf/ai/DccfAiShell.tsx
"use client";

import { useState } from "react";
import { DccfAiLauncher } from "./DccfAiLauncher";
import { DccfAiChatWindow } from "./DccfAiChatWindow";

export function DccfAiShell() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <DccfAiChatWindow onClose={() => setOpen(false)} />}
      <DccfAiLauncher onOpen={() => setOpen(true)} />
    </>
  );
}
