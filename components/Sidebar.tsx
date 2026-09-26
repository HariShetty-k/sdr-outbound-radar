import Link from "next/link";

export function Sidebar({
  active,
  newCount,
  processedCount,
}: {
  active: "new" | "processed";
  newCount: number;
  processedCount: number;
}) {
  return (
    <div
      className="flex flex-col gap-7 p-7 text-white"
      style={{ width: 260, flex: "0 0 260px", background: "var(--sidebar)" }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-[15px]"
          style={{ background: "var(--accent)", color: "var(--sidebar)", fontFamily: "var(--font-sora)" }}
        >
          FB
        </div>
        <div className="font-bold text-[16px]" style={{ fontFamily: "var(--font-sora)" }}>
          Outreach&nbsp;Radar
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div
          className="mt-1 px-3 text-[11px] uppercase"
          style={{ letterSpacing: "0.06em", color: "#6f6355" }}
        >
          Prospecting
        </div>

        <NavItem
          href="/"
          active={active === "new"}
          count={newCount}
          icon={
            <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
          }
        >
          New Brands
        </NavItem>

        <NavItem
          href="/processed"
          active={active === "processed"}
          count={processedCount}
          icon={<path d="M20 6L9 17l-5-5" />}
        >
          Processed
        </NavItem>

        <div
          className="mt-3.5 px-3 text-[11px] uppercase"
          style={{ letterSpacing: "0.06em", color: "#6f6355" }}
        >
          Workspace
        </div>

        <NavItem
          href="#"
          active={false}
          icon={
            <>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 0 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1.04-1.56V3a2 2 0 0 1 4 0v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.36.62.98 1.04 1.56 1.04H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.04z" />
            </>
          }
        >
          Settings
        </NavItem>
      </div>

      <div
        className="mt-auto flex items-center gap-2.5 pt-4"
        style={{ borderTop: "1px solid var(--sidebar-line)" }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold"
          style={{ background: "var(--sidebar-line)", color: "#e9dfd2" }}
        >
          RS
        </div>
        <div>
          <div className="text-[13px] font-semibold">Riya Sen</div>
          <div className="text-[11px]" style={{ color: "var(--sidebar-soft)" }}>
            SDR · F&amp;B vertical
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  href,
  active,
  count,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  count?: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors duration-150"
      style={{
        background: active ? "rgba(255,255,255,0.08)" : "transparent",
        color: active ? "#fff" : "var(--sidebar-soft)",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <svg className="h-[18px] w-[18px] flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        {icon}
      </svg>
      {children}
      {count !== undefined && (
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold"
          style={
            active
              ? { background: "var(--accent)", color: "var(--sidebar)" }
              : { background: "rgba(255,255,255,0.12)", color: "var(--sidebar-soft)" }
          }
        >
          {count}
        </span>
      )}
    </Link>
  );
}
