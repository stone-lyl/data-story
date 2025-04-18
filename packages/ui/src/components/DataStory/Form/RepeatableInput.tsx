import { Param } from '@data-story/core';
import React, { useCallback, useContext } from 'react';
import { useFieldArray } from 'react-hook-form';
import { DragIcon } from '../icons/dragIcon';
import { CloseIcon } from '../icons/closeIcon';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { Row } from '@tanstack/react-table';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FormComponentProps, RepeatableInputProps } from '../types';
import { ParamsComponentFactory } from '../modals/nodeSettingsModal/tabs/Params/ParamsComponentFactory';
import { FormFieldWrapper, FormFieldContext, useFormField } from './UseFormField';

function RepeatableCell({
  param: paramColumn,
  rowIndex,
  node,
}: FormComponentProps & {
  columnIndex: number,
  rowIndex: number,
}) {
  return <FormFieldWrapper fieldName={`${rowIndex}`}>
    <td
      style={{ height: '1px' }}
      scope="row"
      className="border font-medium whitespace-nowrap bg-gray-50 align-top"
    >
      {
        ParamsComponentFactory.defaultInstance.getComponent({
          param: paramColumn,
          node,
          type: paramColumn.type,
        })
      }
    </td>
  </FormFieldWrapper>;
}

function RepeatableDraggableRow(props: RepeatableInputProps & {
  rowIndex: number,
  row: any,
  reorderRow: (draggedRowIndex: number, targetRowIndex: number) => void;
  deleteRow: (index: number) => void
}) {
  const { param, node, row, rowIndex, reorderRow, deleteRow } = props;

  const [, dropRef] = useDrop({
    accept: 'row',
    drop: (draggedRow: Row<unknown>) => reorderRow(draggedRow.index, rowIndex),
  });

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => ({ index: rowIndex, ...row }),
    type: 'row',
  });

  function handleDeleteRow() {
    deleteRow(rowIndex);
  }

  return <tr
    data-cy='data-story-repeatable-row'
    //@ts-ignore https://react-dnd.github.io/react-dnd/docs/api/use-drag
    ref={previewRef}
    style={{ opacity: isDragging ? 0.5 : 1 }}
    className="bg-white border-b dark:border-gray-700">
    <td
      //@ts-ignore https://react-dnd.github.io/react-dnd/docs/api/use-drop
      ref={dropRef}
      className="border font-medium whitespace-nowrap bg-gray-50 align-top w-10"
    >
      <button
        data-cy='data-story-repeatable-drag-row'
        className="p-2"
        //@ts-ignore https://react-dnd.github.io/react-dnd/docs/api/use-drag
        ref={dragRef}>
        <DragIcon/>
      </button>
    </td>
    {
      param.row.map((column: Param, columnIndex: number) => (
        <RepeatableCell
          key={`${param.row[columnIndex].name}-${columnIndex}`}
          param={column}
          rowIndex={rowIndex}
          columnIndex={columnIndex} node={node}
        />
      ))
    }
    <td className="border font-medium whitespace-nowrap bg-gray-50 align-top w-10">
      <button
        className="p-2"
        data-cy='data-story-repeatable-delete-row'
        onClick={handleDeleteRow}
      >
        <CloseIcon/>
      </button>
    </td>
  </tr>;
}

type RowType = {
  id: string;
  key: Record<string, any>,
  value: Record<string, any>
}

function areEqual(prevProps, nextProps) {
  // Check if row is equal
  let isEqualRow = true;
  if(prevProps.row !== nextProps.row) {
    Object.keys(nextProps.row as RowType).forEach((key) => {
      if (prevProps.row[key] !== nextProps.row[key]) {
        isEqualRow = false;
        return;
      }
    });
  }

  return prevProps.rowIndex === nextProps.rowIndex &&
    isEqualRow &&
    prevProps.reorderRow === nextProps.reorderRow &&
    prevProps.deleteRow === nextProps.deleteRow;
}

const MemoRepeatableDraggableRow = React.memo(RepeatableDraggableRow, areEqual);

const defaultRowData = (row: Param[]) => {
  const id = Math.random().toString(36).substring(7);
  const data = Object.fromEntries(row.map((column: Param) => {
    return [column.name, column.input]
  }));
  return {
    id,
    ...data,
  }
}

export function RepeatableComponent({
  param,
  node,
}: RepeatableInputProps) {
  const { control } = useFormField();
  const { fieldName } = useContext(FormFieldContext);
  const { fields, append, remove, swap } = useFieldArray({
    control: control,
    name: fieldName,
  });

  const addRow = useCallback(() => {
    append(defaultRowData(param.row));
  }, [append, param.row]);

  return (
    <div data-cy='data-story-repeatable-input' className="flex flex-col text-xs w-full">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs uppercase bg-gray-50 text-gray-400">
          <tr>
            <th className='p-2 border'/>
            {param.row.map((column: any) => {
              return <th
                key={column.name}
                scope="col"
                className="p-2 border"
              >{column.label}</th>
            })}
            <th className='p-2 border'/>
          </tr>
        </thead>
        <tbody>
          {fields.map((row, i) => {
            return (
              <MemoRepeatableDraggableRow
                key={row.id}
                reorderRow={swap}
                deleteRow={remove}
                row={row} rowIndex={i}
                param={param}
                node={node}
              />
            )
          })}
        </tbody>
      </table>

      <div className="flex bg-gray-50 w-full">
        <button
          data-cy={'data-story-repeatable-add-row'}
          className="border w-full p-2 text-xs uppercase border-rounded text-gray-400"
          onClick={addRow}>Add row
        </button>
      </div>
    </div>
  );
}

export const RepeatableInput = (props: RepeatableInputProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <FormFieldWrapper fieldName={props.param.name}>
        <RepeatableComponent {...props} />
      </FormFieldWrapper>
    </DndProvider>
  )
}
