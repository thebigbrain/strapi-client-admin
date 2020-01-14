import React from 'react';
import GlobalFilter from './GlobalFilter';

export default function GlobalFilterForTable({
  flatColumns,
  preGlobalFilteredRows,
  setGlobalFilter,
  state: { globalFilter }
}) {
  return (
    <tr>
      <th
        colSpan={flatColumns.length}
        style={{
          textAlign: "left"
        }}
      >
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      </th>
    </tr>
  );
}