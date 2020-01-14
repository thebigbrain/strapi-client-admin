import React, { useEffect } from "react";
import { styled, makeStyles, ThemeProvider } from "@material-ui/styles";
import { useTable, usePagination, useGlobalFilter, useFilters } from "react-table";
import matchSorter from 'match-sorter'
import { useOvermind } from "hooks/index";
import Pagination from 'components/Pagination';
import THead from 'components/TableHead';
import TBody from 'components/TableBody';
import DefaultColumnFilter from 'components/Filters/DefaultColumnFilter';

const Styles = styled("div")({
  /* This is required to make the table full-width */
  display: "block",
  maxWidth: "100%"
});

const useStyles = makeStyles({
  /* This will make the table scrollable when it gets too small */
  "table-wrap": {
    display: "block",
    maxWidth: "100%",
    overflow: "auto",
    borderTop: "1px solid black",
    borderBottom: "1px solid black"
  },

  table: {
    /* Make sure the inner table is always as wide as needed */
    width: "100%",
    borderSpacing: 0,

    "& tr": {
      "&:last-child": {
        "& td": {
          borderBottom: 0
        }
      }
    },

    "& th, & td": {
      margin: 0,
      padding: "0.5rem",
      borderBottom: "1px solid black",
      borderRight: "1px solid black",

      /* The secret sauce */
      /* Each cell should grow equally */
      width: "1%",
      "&:last-child": {
        borderRight: 0
      }
    }
  },
});

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [row => row.values[id]] })
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = val => !val

function Table({ columns = [], data = [] }) {
  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter(row => {
          const rowValue = row.values[id]
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true
        })
      },
    }),
    []
  )

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  )

  // Use the state and functions returned from useTable to build your UI
  const instance = useTable(
    {
      columns,
      data,
      // @ts-ignore
      defaultColumn,
      initialState: {
        // @ts-ignore
        pageIndex: 0
      },
      manualFilters: true,
      autoResetFilters: false,
      filterTypes,
    },
    useFilters,
    useGlobalFilter,
    usePagination,
  );

  // @ts-ignore
  const classes = useStyles();
  // Render the UI for your table
  return (
    <Styles>
      <div className={classes["table-wrap"]}>
        <table className={classes.table} {...instance.getTableProps()}>
          <THead {...instance} />
          <TBody {...instance} />
        </table>
        {/* 
        Pagination can be built however you'd like. 
        This is just a very basic UI implementation:
      */}
      </div>
      <Pagination {...instance} />
    </Styles>
  );
}

export default function({ columns, gql, collection }) {
  const { state, actions } = useOvermind();

  useEffect(() => {
    // @ts-ignore
    actions.collections.query(gql);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gql]);

  // @ts-ignore
  const data = state.collections[collection]; 

  const theme = React.useMemo(() => ({
    collapse: {
      width: "0.0000000001%;"
    },
    pagination: {
      padding: "0.5rem"
    }
  }), []);

  columns.forEach(c => {
    
  });

  return (
    <ThemeProvider theme={theme}>
      <Table columns={columns} data={data} />
    </ThemeProvider>
  );
}
