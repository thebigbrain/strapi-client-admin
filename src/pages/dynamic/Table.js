/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@material-ui/styles";
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useFilters,
  useSortBy
} from "react-table";
import { useOvermind } from "hooks/index";
import Table from "components/Table";
import THead from "components/TableHead";
import TBody from "components/TableBody";
import Pagination from "components/Pagination";
import GlobalFilterForTable from "components/Filters/GlobalFilterForTable";
import DefaultColumnFilter from "components/Filters/DefaultColumnFilter";
import NumberRangeColumnFilter from "components/Filters/NumberRangeColumnFilter";
import { FullFlexRow, FlexPadding } from "components/elements";

const FILTERS = {
  text: DefaultColumnFilter,
  between: NumberRangeColumnFilter
};

const theme = {
  collapse: {
    width: "0.0000000001%;"
  },
  pagination: {
    padding: "0.5rem 0.5rem 0.5rem 0"
  }
};

function CustomPagination({ instance, total }) {
  return (
    <Pagination
      {...instance}
      total={total}
    />
  );
}


export default function({ columns, collection, fields, pageSize = 10 }) {
  const { state, actions } = useOvermind();
  const { data, count } = state.collections.getData(collection);
  const [pageCount, setPageCount] = useState(Math.ceil(count / pageSize) || 1);

  const initialState = state.collections.getInstanceState(collection, {
    collection,
    pageIndex: 0,
    pageSize,
    globalFilter: ''
  });

  useEffect(() => {
    actions.collections.saveInstance(instance);
  }, [collection, fields]);

  useMemo(() => {
    columns.forEach(c => {
      c.filter = c.filter || "text";
      c.Filter = FILTERS[c.filter] || DefaultColumnFilter;
      actions.collections.setFilter(c);
    });
  }, [columns]);

  console.log("render table ...");

  const instance = useTable(
    {
      columns,
      data,
      pageCount,
      initialState,

      manualFilters: true,
      manualSortBy: true,
      manualPagination: true,
      manualGlobalFilter: true,
      autoResetFilters: false,
      autoResetGlobalFilter: false
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  useEffect(() => {
    setPageCount(Math.ceil(count / instance.state.pageSize) || 1);
  }, [instance.state.pageSize, count]);

  useEffect(() => {
    actions.collections.updateInstance(instance);
  }, [
    instance.state.sortBy, instance.state.globalFilter, instance.state.pageSize, instance.state.pageIndex, 
    instance.state.filters,
  ]);

  console.log(instance);

  return (
    <ThemeProvider theme={theme}>
      <Table
        {...instance.getTableProps()}
        head={
          <THead {...instance} >
            <FullFlexRow>
              <GlobalFilterForTable {...instance} />
              <FlexPadding/>
            </FullFlexRow>
          </THead>
        }
        body={<TBody {...instance} />}
        pagination={<CustomPagination instance={instance} total={count} />}
      />
    </ThemeProvider>
  );
}
