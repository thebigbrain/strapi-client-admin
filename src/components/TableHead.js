import React from "react";
import { useTheme } from "@material-ui/styles";
import { Icon } from "antd";
import { noopEventHandler } from "utils/utils";

function Sorter({ column }) {
  return (
    <span>
      {column.isSorted ? (
        column.isSortedDesc ? (
          <Icon type="caret-down" />
        ) : (
          <Icon type="caret-up" />
        )
      ) : (
        ""
      )}
    </span>
  );
}

function ColumnFilter({ column }) {
  return (
    <div onClick={noopEventHandler}>
      {column.canFilter ? column.render("Filter") : null}
    </div>
  );
}

export default function THead({ flatColumns, headerGroups, children }) {
  const theme = useTheme();

  return (
    <thead>
      <tr>
        <th
          colSpan={flatColumns.length}
          style={{
            textAlign: "left"
          }}
        >
          {children}
        </th>
      </tr>

      {headerGroups.map(headerGroup => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map(column => (
            <th
              {...column.getHeaderProps(
                column.getSortByToggleProps({
                  style: column.collapse ? theme.collapse : ""
                })
              )}
            >
              <div>
                {column.render("Header")}
                {/* Render the columns filter UI */}
                <Sorter column={column} />
              </div>

              <ColumnFilter column={column} />
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
}
