"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableRow from "./SortableRow";
import OutletService from "@/services/OutletService";


export default function DragDropTable({ columns, rows, onReorder, className }) {
  const initialData = useMemo(() => rows.map((row, index) => ({ ...row, serial: index + 1 })), [rows]);
  const [data, setData] = useState(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const sensors = useSensors(useSensor(PointerSensor));

  const items = useMemo(() => data.map((r) => r.uo_id), [data]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = data.findIndex((r) => r.uo_id === active.id);
    const newIndex = data.findIndex((r) => r.uo_id === over.id);
    let next = arrayMove(data, oldIndex, newIndex);

    // update serial numbers after reorder
    next = next.map((row, index) => ({ ...row, serial: index + 1 }));

    setData(next);
    onReorder && onReorder(next);

    const startIndex = Math.min(oldIndex, newIndex);
    const endIndex = Math.max(oldIndex, newIndex);
    const movedItems = next.slice(startIndex, endIndex + 1);

    // --- API CALL to save order ---
    try {
      console.log("movedItems", movedItems);

      if(movedItems && movedItems.length > 0) {
        movedItems.forEach(async(item, index) => {
          // console.log("item", item);
          const res = await OutletService.Commands.updateOutlet(
            item.uo_id, 
            {
              ...item,
              uo_serial: item?.serial,
              _method: 'PUT'
            }
          )

          console.log("res", res);
        })
      }
    } catch (err) {
      console.error("Failed to update order", err);
    }
  };

  return (
    <div className={"w-full overflow-x-auto " + (className ?? "") }>
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <table className="min-w-full border-collapse rounded-lg overflow-hidden shadow-lg">
            <thead>
              <tr className="bg-blue-600 text-left text-sm text-white">
                <th className="w-10 px-2 py-2"></th>
                {columns.map((col) => (
                  <th key={col.key} className="px-6 py-3 font-medium" style={{ width: col.width }}>
                    {col.header}
                  </th>
                ))}
                
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <SortableRow key={index} row={row} columns={columns} />
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
    </div>
  );
}