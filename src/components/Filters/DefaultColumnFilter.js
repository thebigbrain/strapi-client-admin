import React from "react";
import { Input } from "antd";

// Define a default UI for filtering
export default function DefaultColumnFilter({
  column: { filterValue, preFilteredRows = [], setFilter }
}) {
  const count = preFilteredRows.length;

  return (
    <Input
      value={filterValue || ""}
      onChange={e => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`搜索 ${count} 条记录...`}
    />
  );
}
