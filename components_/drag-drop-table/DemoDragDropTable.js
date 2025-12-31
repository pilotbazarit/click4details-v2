"use client";

import React, { useState } from "react";
import DragDropTable from "./DragDropTable";

export function DemoDragDropTable() {
  const [rows, setRows] = useState([
    { id: 1, name: "Ayesha Akter", role: "Admin", email: "ayesha@example.com" },
    { id: 2, name: "Sajid Hasan", role: "Editor", email: "sajid@example.com" },
    { id: 3, name: "Nadia Khan", role: "Viewer", email: "nadia@example.com" },
    { id: 4, name: "Rafiul Islam", role: "Moderator", email: "rafiul@example.com" },
  ]);

  const columns = [
    { key: "name", header: "Name", width: "30%" },
    { key: "role", header: "Role", width: "20%" },
    { key: "email", header: "Email" },
    { key: "serial", header: "Serial" },
  ];

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-3">Drag & Drop Table (Demo)</h2>
      <p className="text-sm text-gray-500 mb-4">Drag the handle on the left to reorder rows.</p>
      <DragDropTable
        columns={columns}
        rows={rows}
        onReorder={(next) => setRows(next)}
      />
      <pre className="mt-4 text-xs bg-gray-50 p-3 rounded border">{JSON.stringify(rows, null, 2)}</pre>
    </div>
  );
}