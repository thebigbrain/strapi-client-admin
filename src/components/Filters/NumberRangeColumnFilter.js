import React from 'react';
import { InputNumber } from 'antd';

// This is a custom UI for our 'between' or number range
// filter. It uses two number boxes and filters rows to
// ones that have values between the two
export default function NumberRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter, id },
}) {
  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    preFilteredRows.forEach(row => {
      min = Math.min(row.values[id], min)
      max = Math.max(row.values[id], max)
    })
    return [min, max]
  }, [id, preFilteredRows]);

  return (
    <div
      style={{
        display: 'flex',
      }}
    >
      <InputNumber
        value={filterValue[0] || ''}
        onChange={val => {
          setFilter((old = []) => [val ? parseInt(val, 10) : null, old[1]])
        }}
        placeholder={min}
      />
      -
      <InputNumber
        value={filterValue[1] || ''}
        onChange={val => {
          setFilter((old = []) => [old[0], val ? parseInt(val, 10) : null])
        }}
        placeholder={max}
      />
    </div>
  )
}