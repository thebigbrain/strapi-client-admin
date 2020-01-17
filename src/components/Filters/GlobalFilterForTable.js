import React from "react";
import GlobalFilter from "./GlobalFilter";

export default function GlobalFilterForTable({
  preGlobalFilteredRows,
  setGlobalFilter,
  state: { globalFilter }
}) {
  return (
    <GlobalFilter
      preGlobalFilteredRows={preGlobalFilteredRows}
      globalFilter={globalFilter}
      setGlobalFilter={setGlobalFilter}
    />
  );
}
