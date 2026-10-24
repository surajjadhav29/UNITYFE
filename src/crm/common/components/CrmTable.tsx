import {
  type HTMLAttributes,
  type ReactNode,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import { cn } from '../lib/cn';

export const crmTableActionsClass = 'crm-table-grid-actions';

export const crmTableLinkClass = 'crm-table-grid-link';

export type CrmTableProps = TableHTMLAttributes<HTMLTableElement> & {
  stickyHeader?: boolean;
  variant?: 'default' | 'embedded';
  wrapClassName?: string;
};

function CrmTableRoot({
  children,
  className,
  stickyHeader = false,
  variant = 'default',
  wrapClassName,
  ...props
}: CrmTableProps) {
  return (
    <div
      className={cn(
        'crm-table-grid-wrap',
        variant === 'embedded' && 'crm-table-grid-wrap--embedded',
        wrapClassName,
      )}
    >
      <table
        className={cn('crm-table-grid', className)}
        data-sticky-head={stickyHeader ? '' : undefined}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function CrmTableHead({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={className} {...props} />;
}

export function CrmTableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function CrmTableHeadCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('crm-table-grid-th', className)} {...props} />;
}

export function CrmTableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('crm-table-grid-td', className)} {...props} />;
}

export type CrmTableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  selected?: boolean;
  interactive?: boolean;
  alert?: boolean;
};

export function CrmTableRow({
  className,
  selected,
  interactive,
  alert,
  ...props
}: CrmTableRowProps) {
  return (
    <tr
      className={cn(
        interactive && 'crm-table-grid-row-interactive',
        selected && 'crm-table-grid-row-selected',
        alert && 'crm-table-grid-row-alert',
        className,
      )}
      {...props}
    />
  );
}

export function CrmTableEmptyRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="crm-table-grid-td crm-table-grid-empty">
        {children}
      </td>
    </tr>
  );
}

export const CrmTable = Object.assign(CrmTableRoot, {
  Head: CrmTableHead,
  Body: CrmTableBody,
  HeadCell: CrmTableHeadCell,
  Cell: CrmTableCell,
  Row: CrmTableRow,
  EmptyRow: CrmTableEmptyRow,
});

/** @deprecated use CrmTable.HeadCell — kept for imports */
export const crmTableHeadCellClass = 'crm-table-grid-th';
/** @deprecated use CrmTable.Cell */
export const crmTableCellClass = 'crm-table-grid-td';
