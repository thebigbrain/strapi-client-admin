import React from 'react';
import DefaultColumnFilter from 'components/Filters/DefaultColumnFilter';

export default function(instance) {
  instance.column.setFilter = (value) => {
    console.log(instance.column.id)
    instance.setFilter(instance.column.id, [`${instance.column.id}_contains:${value}`]);
  };

  return <DefaultColumnFilter {...instance}/>
}