"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export default function SortableRow({ row, columns }) {
  // console.log("sortable row", row);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.uo_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none',
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing hover:bg-gray-50 border-b border-gray-200 ${isDragging ? "bg-gray-50 shadow" : "bg-white"}`}
    >
      {/* Drag handle cell */}
      <td className="w-10 px-2 py-3 align-middle text-gray-500">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 flex justify-center items-center">
          <GripVertical className="h-5 w-5" />
        </div>
      </td>

      {columns.map((col) => (
        <td 
          key={col.key} 
          className="px-6 py-4 align-middle" 
          style={{ width: col.width }}
        >
          {col.render ? col.render(row) : row[col.key] ? row[col.key] : "N/A"}
        </td>
      ))}

      
    </tr>
  );
}