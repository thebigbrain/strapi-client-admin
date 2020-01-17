import React from 'react';
import NumberRangeColumnFilter from "components/Filters/NumberRangeColumnFilter";

export default function(instance){
  const setFilter = (getRanges) => {
    let ranges = getRanges(instance.column.filterValue);
    instance.column.setFilter(ranges);
  };

  const column = {
    setFilter
  };

  return <NumberRangeColumnFilter {...instance} column={Object.assign({}, instance.column, column)}/>
}
