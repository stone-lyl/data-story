import React, { memo } from 'react';
import { VirtualItem, Virtualizer } from '@tanstack/react-virtual';
import { flexRender, RowModel } from '@tanstack/react-table';
import { calculateColumnWidth, FIXED_HEIGHT } from './TableCell';

export const MemoizedTableBody = memo(({
  virtualRows,
  getRowModel,
  virtualColumns,
  rowVirtualizer
}: {
  virtualRows: VirtualItem[];
  virtualColumns: VirtualItem[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  getRowModel: () => RowModel<Record<string, unknown>>
}) => {
  return (
    <tbody
      style={{
        display: 'grid',
        height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
        position: 'relative', //needed for absolute positioning of rows
      }}>
      {virtualRows.map((virtualRow, rowindex) => {
        const row = getRowModel().rows[virtualRow.index];
        // console.log(row.getVisibleCells(), 'row');
        return (
          <tr
            data-cy={'data-story-table-row'}
            className="odd:bg-gray-50 w-full text-xs"
            key={row.id}
            style={{
              display: 'flex',
              width: '100%',
              height: `${FIXED_HEIGHT}px`,
              position: 'absolute',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {/**fake empty column to the left for virtualization scroll padding **/}
            {/* <td
              style={{
                display: 'var(--virtual-padding-left-display)',
                width: 'calc(var(--virtual-padding-left) * 1px)',
              }}
            /> */}
            {virtualColumns.map((virtualColumn) => {
              const cell = row.getVisibleCells()[virtualColumn.index];
              // @ts-ignore
              const maxChars = cell.column.columnDef.meta?.maxChars ?? 0;
              const width = Math.min(320, maxChars * 8 + 24); // Cap maximum width, 8px per character + 24px padding
              return (
                <td
                  key={cell.id}
                  className="whitespace-nowrap text-left"
                  style={{
                    display: 'flex',
                    position: 'relative',
                    width: `${width}px`,
                    height: `${FIXED_HEIGHT}px`,
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              )
            })}
            <td
              style={{
                display: 'var(--virtual-padding-right-display)',
                width: 'calc(var(--virtual-padding-right) * 1px)',
              }}
            />
          </tr>
        );
      })}
    </tbody>
  );
});