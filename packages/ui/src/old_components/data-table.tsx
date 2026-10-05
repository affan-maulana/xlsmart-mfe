import * as React from "react";

import { cn } from "../lib/utils";
import { Skeleton } from "./skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

/**
 * A column is a header plus a render function. Using a render function (rather
 * than a property key) keeps this component unaware of any domain shape, so
 * Customer360, Queue and PreToPost can all describe their own rows.
 */
export interface DataTableColumn<TRow> {
  id: string;
  header: React.ReactNode;
  cell: (row: TRow, rowIndex: number) => React.ReactNode;
  /** Trailing columns usually hold actions and want to stop shrinking. */
  className?: string;
  headClassName?: string;
}

export interface DataTableProps<TRow> extends Omit<React.ComponentProps<typeof Table>, "children"> {
  columns: ReadonlyArray<DataTableColumn<TRow>>;
  rows: ReadonlyArray<TRow>;
  rowKey: (row: TRow, index: number) => string | number;
  /** Renders a skeleton while the server request is in flight. */
  isLoading?: boolean;
  skeletonRows?: number;
  empty?: React.ReactNode;
  onRowSelect?: (row: TRow) => void;
}

function DataTable<TRow>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  skeletonRows = 5,
  empty,
  onRowSelect,
  className,
  ...props
}: DataTableProps<TRow>) {
  const columnCount = columns.length;

  return (
    <Table {...props} data-slot="data-table" className={cn(className)}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.id} className={column.headClassName}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: skeletonRows }, (_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`}>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton className="h-4 w-full max-w-40" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : rows.map((row, rowIndex) => {
              const interactive = Boolean(onRowSelect);

              return (
                <TableRow
                  key={rowKey(row, rowIndex)}
                  data-interactive={interactive || undefined}
                  tabIndex={interactive ? 0 : undefined}
                  onClick={interactive ? () => onRowSelect?.(row) : undefined}
                  onKeyDown={
                    interactive
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onRowSelect?.(row);
                          }
                        }
                      : undefined
                  }
                  className={interactive ? "cursor-pointer" : undefined}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.className}>
                      {column.cell(row, rowIndex)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}

        {!isLoading && rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columnCount} className="text-muted-foreground h-24 text-center">
              {empty ?? "No records found."}
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  );
}

export { DataTable };
