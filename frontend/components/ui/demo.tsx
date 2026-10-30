"use client"

import GlassFolder from "./glass-folder-cards"

export default function GlassFolderCardsDemo() {
  return (
    <div
      className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-background px-6 py-16"
      style={{ minHeight: "100svh" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-foreground opacity-[0.13]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1.1px, transparent 1.4px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative grid max-w-[1180px] grid-cols-1 items-end justify-items-center gap-x-14 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
        <GlassFolder label="AI Knowledge Platform" art="aurora" seed={3} appearDelay={0} />
        <GlassFolder
          label="PCVA: Verbal Autopsy"
          art="ember"
          action="more"
          appearDelay={140}
          files={[
            { name: "Mobile Sync Engine", meta: "SQLite · Offline-first" },
            { name: "Web Admin Portal", meta: "Angular · Node.js" },
          ]}
        />
        <GlassFolder
          label="DPH-LMS"
          meta="Health Dept"
          tone="dark"
          art="dusk"
          seed={11}
          action="none"
          appearDelay={280}
        />
      </div>
    </div>
  )
}
