export function LeadAvatar({ name, size = 36 }: { name: string; size?: number }) {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
      : (parts[0]?.slice(0, 2) ?? '?').toUpperCase();
  const hue = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % 360;

  return (
    <span
      className="ld-avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `hsl(${hue} 45% 88%)`,
        color: `hsl(${hue} 35% 32%)`,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
