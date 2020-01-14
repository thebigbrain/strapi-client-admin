import React from 'react';
import GlobalFilterForTable from './Filters/GlobalFilterForTable';
import { useTheme } from '@material-ui/styles';

export default function THead(props) {
  const { headerGroups } = props;

  const theme = useTheme();

  return (
    <thead>
      <GlobalFilterForTable {...props} />
      {headerGroups.map(headerGroup => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map(column => (
            <th
              {...column.getHeaderProps({
                // @ts-ignore
                style: column.collapse ? theme.collapse : ""
              })}
            >
              {column.render("Header")}
              {/* Render the columns filter UI */}
              <div>{column.canFilter ? column.render('Filter') : null}</div>
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
}