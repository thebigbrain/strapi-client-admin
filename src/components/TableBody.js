import React from 'react';
import { useTheme, styled } from '@material-ui/styles';

const StyledBody = styled('tbody')({
  '&:hover': {
    cursor: 'pointer'
  }
});

export default function TBody(props) {
  const {
    getTableBodyProps,
    prepareRow,
    page, // Instead of using 'rows', we'll use page, which has only the rows for the active page

    // global filter
    rows,

    // The rest of these things are super handy, too ;)
    state: { globalFilter }
  } = props;

  const theme = useTheme();
  return (
    <StyledBody {...getTableBodyProps()}>
      {(globalFilter == null ? page : rows).map((row, i) => {
        prepareRow(row);
        return (
          <tr {...row.getRowProps()}>
            {row.cells.map(cell => {
              return (
                <td
                  {...cell.getCellProps({
                    style: cell.column.collapse
                      ? 
                        // @ts-ignore
                        theme.collapse
                      : ""
                  })}
                >
                  {cell.render("Cell")}
                </td>
              );
            })}
          </tr>
        );
      })}
    </StyledBody>
  );
}