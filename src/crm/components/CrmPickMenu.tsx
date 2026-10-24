import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type SyntheticEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export interface CrmPickOption<T extends string> {
  value: T;
  label: string;
  color: string;
}

interface CrmPickMenuProps<T extends string> {
  value: T;
  options: CrmPickOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  /** Wider trigger for long status labels */
  size?: 'status' | 'priority';
  stopDrag?: boolean;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace('#', '').trim();
  if (h.length !== 6) return null;
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r, g, b };
}

function pickTriggerStyle(accent: string): CSSProperties {
  const rgb = hexToRgb(accent);
  if (!rgb) {
    return {
      ['--crm-pick-accent' as string]: accent,
      ['--crm-pick-bg' as string]: '#f1f5f9',
      ['--crm-pick-border' as string]: '#e2e8f0',
      ['--crm-pick-text' as string]: '#334155',
    };
  }
  const { r, g, b } = rgb;
  return {
    ['--crm-pick-accent' as string]: accent,
    ['--crm-pick-bg' as string]: `rgba(${r}, ${g}, ${b}, 0.12)`,
    ['--crm-pick-border' as string]: `rgba(${r}, ${g}, ${b}, 0.28)`,
    ['--crm-pick-text' as string]: `rgb(${Math.round(r * 0.35)}, ${Math.round(g * 0.35)}, ${Math.round(b * 0.35)})`,
  };
}

const MENU_GAP = 6;
const MENU_MAX_H = 280;

export function CrmPickMenu<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  size = 'status',
  stopDrag = false,
}: CrmPickMenuProps<T>) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({ visibility: 'hidden' });

  const selected = options.find((o) => o.value === value) ?? options[0];

  const blockDrag = useCallback(
    (event: SyntheticEvent) => {
      if (!stopDrag) return;
      event.stopPropagation();
    },
    [stopDrag],
  );

  const close = useCallback(() => setOpen(false), []);

  const positionMenu = useCallback(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;

    const rect = trigger.getBoundingClientRect();
    const menuH = menu.offsetHeight || MENU_MAX_H;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuH + MENU_GAP && rect.top > menuH + MENU_GAP;

    const top = openUp ? rect.top - menuH - MENU_GAP : rect.bottom + MENU_GAP;
    let left = rect.left;
    const menuW = menu.offsetWidth || 240;
    if (left + menuW > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - menuW - 12);
    }

    setMenuStyle({
      position: 'fixed',
      top,
      left,
      zIndex: 10050,
      visibility: 'visible',
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    positionMenu();
    const onReflow = () => positionMenu();
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);
    return () => {
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
    };
  }, [open, positionMenu, options.length]);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  function pick(next: T) {
    if (next !== value) onChange(next);
    close();
  }

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="crm-pick-menu"
          style={menuStyle}
          onMouseDown={blockDrag}
        >
          <ul className="crm-pick-menu-list">
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`crm-pick-menu-item${active ? ' is-active' : ''}`}
                    onClick={() => pick(opt.value)}
                  >
                    <span
                      className="crm-pick-dot"
                      style={{ backgroundColor: opt.color }}
                      aria-hidden
                    />
                    <span className="crm-pick-menu-label">{opt.label}</span>
                    {active ? <Check size={16} className="crm-pick-check" aria-hidden /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>,
        document.body,
      )
    : null;

  return (
    <div
      ref={rootRef}
      className={`crm-pick${size === 'priority' ? ' crm-pick--priority' : ' crm-pick--status'}`}
      onMouseDown={blockDrag}
      onPointerDown={blockDrag}
      onDragStart={blockDrag}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`crm-pick-trigger${open ? ' is-open' : ''}`}
        style={pickTriggerStyle(selected.color)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <span className="crm-pick-dot" style={{ backgroundColor: selected.color }} aria-hidden />
        <span className="crm-pick-trigger-label">{selected.label}</span>
        <ChevronDown size={14} className="crm-pick-chevron" aria-hidden />
      </button>
      {menu}
    </div>
  );
}
