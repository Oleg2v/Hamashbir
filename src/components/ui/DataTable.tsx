import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type Column<T> = {
  key: string;
  header: ReactNode;
  /** Label shown before the value when rows stack into cards (defaults to a string header). */
  label?: string;
  cell: (row: T) => ReactNode;
  /** Mono, tabular, unbreakable value. */
  numeric?: boolean;
  /** The row's name: shown without a label, at body size, when stacked. */
  primary?: boolean;
  className?: string;
};

type RowState = { selected?: boolean; force?: 'hover' };

/**
 * The table-row primitive. Desktop: a real <table>. Below 56rem the rows
 * become cards (`table--stack`); because display changes drop table
 * semantics in some browsers, every element carries its explicit ARIA role,
 * and each cell gets its stacked label from the column definition — headers
 * and labels can never drift apart. The wrapper scrolls, never clips.
 */
export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  rowState,
  footer,
  className,
}: {
  caption?: ReactNode;
  columns: ReadonlyArray<Column<T>>;
  rows: ReadonlyArray<T>;
  rowKey: (row: T) => string;
  rowState?: (row: T) => RowState | undefined;
  /** Footer cells: [label, value] — label spans all but the last column. */
  footer?: { label: ReactNode; value: ReactNode };
  className?: string;
}) {
  return (
    <div className={cn('table-wrap', className)}>
      <table className="table table--stack" role="table">
        {caption ? <caption>{caption}</caption> : null}
        <thead role="rowgroup">
          <tr role="row">
            {columns.map((c) => (
              <th key={c.key} scope="col" role="columnheader">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.map((row) => {
            const st = rowState?.(row);
            return (
              <tr key={rowKey(row)} role="row" data-selected={st?.selected ? '' : undefined} data-force={st?.force}>
                {columns.map((c) => (
                  <td
                    key={c.key}
                    role="cell"
                    data-label={
                      c.primary ? undefined : (c.label ?? (typeof c.header === 'string' ? c.header : undefined))
                    }
                    data-primary={c.primary ? '' : undefined}
                    className={cn(c.numeric && 'cell-value', c.primary && 'cell-strong', c.className)}
                  >
                    {/* one flex item per cell, so a stacked label | value row never splits a value */}
                    <span className="cell-content">
                      {c.cell(row)}
                      {c.primary && st?.selected ? <span className="sr-only"> (נבחר)</span> : null}
                    </span>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
        {footer ? (
          <tfoot role="rowgroup">
            <tr role="row">
              <td role="cell" colSpan={Math.max(1, columns.length - 1)}>
                {footer.label}
              </td>
              <td role="cell" className="cell-value">
                {footer.value}
              </td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
