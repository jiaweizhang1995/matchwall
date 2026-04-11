export const IconMark = () => (
  <svg aria-hidden="true" width="84" height="84" viewBox="0 0 40 40" fill="none">
    {/* 银汉 — the Milky Way, a faint scatter beneath the bridge */}
    <g fill="#C9476A">
      <circle cx="6" cy="31" r="0.85" opacity="0.45" />
      <circle cx="12" cy="30.3" r="0.75" opacity="0.5" />
      <circle cx="19" cy="30.8" r="0.7" opacity="0.38" />
      <circle cx="26" cy="30.3" r="0.75" opacity="0.5" />
      <circle cx="33" cy="31" r="0.85" opacity="0.45" />
    </g>
    {/* 鹊桥 — the bridge of magpies, arcing from Vega to Altair */}
    <path
      d="M 7 21 Q 20 4 33 21"
      stroke="#C9476A"
      strokeWidth="1.9"
      strokeLinecap="round"
      fill="none"
    />
    {/* 织女星 Vega — smaller western star, 4-point sparkle at r=3.4 */}
    <path
      d="M 7 17.6 L 8.13 19.87 L 10.4 21 L 8.13 22.13 L 7 24.4 L 5.87 22.13 L 3.6 21 L 5.87 19.87 Z"
      fill="#D75C4B"
    />
    {/* 牛郎星 Altair — larger eastern star, 4-point sparkle at r=4.2 */}
    <path
      d="M 33 16.8 L 34.4 19.6 L 37.2 21 L 34.4 22.4 L 33 25.2 L 31.6 22.4 L 28.8 21 L 31.6 19.6 Z"
      fill="#D75C4B"
    />
  </svg>
);

export const IconBack = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10H5M5 10l5-5M5 10l5 5"/></svg>
);
export const IconPlus = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 3v12M3 9h12"/></svg>
);
export const IconTrash = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4M13 4v9.33a1.33 1.33 0 01-1.33 1.34H4.33A1.33 1.33 0 013 13.33V4"/></svg>
);
export const IconEdit = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11.33 2a1.89 1.89 0 012.67 2.67l-8.67 8.66L2 14l.67-3.33z"/></svg>
);
export const IconMale = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="9.5" r="4"/><path d="M10 6l4-4M14 2h-3.5M14 2v3.5"/></svg>
);
export const IconFemale = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="6" r="4"/><path d="M8 10v4.5M6 13h4"/></svg>
);
export const IconKey = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 1l4 4-2 2-4-4"/><circle cx="5" cy="11" r="3.5"/></svg>
);
export const IconUser = () => (
  <svg aria-hidden="true" width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="var(--c-line)"/><circle cx="20" cy="15" r="6" fill="var(--c-muted)"/><path d="M8 34c0-6.63 5.37-12 12-12s12 5.37 12 12" fill="var(--c-muted)"/></svg>
);
