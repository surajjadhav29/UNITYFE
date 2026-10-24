import { useRef, useState, type DragEvent, type ReactNode } from 'react';
import { ChevronUp, GripVertical } from 'lucide-react';
import {
  moveSectionToIndex,
  reorderDashboardSections,
  saveDashboardSectionOrder,
  type DashboardSectionId,
} from '../../utils/dashboardSectionOrder';

const DRAG_MIME = 'application/x-unity-dashboard-section';

interface DashboardSectionsGridProps {
  order: DashboardSectionId[];
  onOrderChange: (order: DashboardSectionId[]) => void;
  sections: Partial<Record<DashboardSectionId, ReactNode>>;
}

export function DashboardSectionsGrid({
  order,
  onOrderChange,
  sections,
}: DashboardSectionsGridProps) {
  const draggingRef = useRef<DashboardSectionId | null>(null);
  const [draggingId, setDraggingId] = useState<DashboardSectionId | null>(null);
  const [overId, setOverId] = useState<DashboardSectionId | null>(null);
  const [dropEdge, setDropEdge] = useState<'top' | 'bottom' | null>(null);

  const visibleOrder = order.filter((id) => sections[id] != null);

  function commit(next: DashboardSectionId[]) {
    onOrderChange(next);
    saveDashboardSectionOrder(next);
  }

  function readDraggedId(event: DragEvent): DashboardSectionId | null {
    const fromMime = event.dataTransfer.getData(DRAG_MIME);
    const fromText = event.dataTransfer.getData('text/plain');
    const id = (fromMime || fromText || draggingRef.current) as DashboardSectionId;
    return id || null;
  }

  function onDragStart(id: DashboardSectionId, event: DragEvent) {
    draggingRef.current = id;
    setDraggingId(id);
    event.dataTransfer.setData(DRAG_MIME, id);
    event.dataTransfer.setData('text/plain', id);
    event.dataTransfer.effectAllowed = 'move';
  }

  function onDragEnd() {
    draggingRef.current = null;
    setDraggingId(null);
    setOverId(null);
    setDropEdge(null);
  }

  function moveToTop(id: DashboardSectionId) {
    commit(moveSectionToIndex(order, id, 0));
  }

  function onSlotDragOver(id: DashboardSectionId, event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    setDropEdge(null);
    const dragged = draggingRef.current;
    if (dragged && dragged !== id) setOverId(id);
  }

  function onSlotDrop(id: DashboardSectionId, event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const dragged = readDraggedId(event);
    if (!dragged || dragged === id) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const placement = event.clientY > rect.top + rect.height / 2 ? 'after' : 'before';
    commit(reorderDashboardSections(order, dragged, id, placement));
    onDragEnd();
  }

  function onEdgeDragOver(edge: 'top' | 'bottom', event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    setOverId(null);
    setDropEdge(edge);
  }

  function onEdgeDrop(edge: 'top' | 'bottom', event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const dragged = readDraggedId(event);
    if (!dragged) return;
    const index = edge === 'top' ? 0 : Math.max(0, order.length - 1);
    commit(moveSectionToIndex(order, dragged, index));
    onDragEnd();
  }

  function renderToolbar(id: DashboardSectionId) {
    return (
      <div className="dn-section-drag-cluster">
        <div
          role="button"
          tabIndex={0}
          className="dn-section-drag-handle"
          draggable
          aria-label="Drag to reorder section"
          onDragStart={(e) => onDragStart(id, e)}
          onDragEnd={onDragEnd}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
          }}
        >
          <GripVertical size={16} strokeWidth={2} aria-hidden />
        </div>
        <button
          type="button"
          className="dn-section-to-top"
          title="Move to top"
          aria-label="Move section to top"
          onClick={() => moveToTop(id)}
        >
          <ChevronUp size={15} strokeWidth={2} aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div
      className="dn-sections-grid"
      aria-label="Dashboard sections"
      onDragOver={(e) => {
        if (draggingRef.current) e.preventDefault();
      }}
    >
      {draggingId ? (
        <div
          className={`dn-section-drop-edge dn-section-drop-top${dropEdge === 'top' ? ' dn-section-drop-edge-active' : ''}`}
          onDragOver={(e) => onEdgeDragOver('top', e)}
          onDragLeave={() => setDropEdge((edge) => (edge === 'top' ? null : edge))}
          onDrop={(e) => onEdgeDrop('top', e)}
        >
          Drop here to move to top
        </div>
      ) : null}

      {visibleOrder.map((id) => (
        <div
          key={id}
          className={`dn-section-slot${draggingId === id ? ' dn-section-slot-dragging' : ''}${
            overId === id ? ' dn-section-slot-over' : ''
          }`}
          onDragOver={(e) => onSlotDragOver(id, e)}
          onDragLeave={() => setOverId((c) => (c === id ? null : c))}
          onDrop={(e) => onSlotDrop(id, e)}
        >
          <div className="dn-section-slot-toolbar">{renderToolbar(id)}</div>
          <div className="dn-section-slot-body">{sections[id]}</div>
        </div>
      ))}

      {draggingId ? (
        <div
          className={`dn-section-drop-edge dn-section-drop-bottom${dropEdge === 'bottom' ? ' dn-section-drop-edge-active' : ''}`}
          onDragOver={(e) => onEdgeDragOver('bottom', e)}
          onDragLeave={() => setDropEdge((edge) => (edge === 'bottom' ? null : edge))}
          onDrop={(e) => onEdgeDrop('bottom', e)}
        >
          Drop here to move to bottom
        </div>
      ) : null}
    </div>
  );
}
