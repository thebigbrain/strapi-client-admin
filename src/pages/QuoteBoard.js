import React from 'react';
import {MultiGrid} from 'react-virtualized';
import {withSize} from 'react-sizeme';
import {StyledQuoteBoard} from '../components/elements';
import {useOvermind} from '../hooks/overmind';
import {useInterval} from '../hooks';
import {useQuery} from '@apollo/react-hooks';

function _DataGrid({size}) {
  const {state, actions} = useOvermind();
  const {header, body} = state.quote;
  const list = [header].concat(body);

  const rowCount = list.length;
  const rowHeight = 40;

  const columnWidth = size.width / 5;

  function cellRenderer({columnIndex, key, rowIndex, style}) {
    return (
      <div key={key} style={Object.assign({}, style, {textAlign: 'center', lineHeight: `${style.height}px`})}>
        {list[rowIndex][columnIndex]}
      </div>
    );
  }

  useInterval(() => {
    actions.quote.updateQuoteBasic()
  }, state.quote.pollInterval);

  return (
    <MultiGrid
      cellRenderer={cellRenderer}
      columnWidth={columnWidth}
      columnCount={list[0].length}
      fixedColumnCount={3}
      fixedRowCount={1}
      rowHeight={rowHeight}
      rowCount={rowCount}
      width={size.width}
      height={rowHeight * rowCount}
      enableFixedColumnScroll
      enableFixedRowScroll
      hideTopRightGridScrollbar
      hideBottomLeftGridScrollbar
    />
  );
}

export const DataGrid = withSize()(_DataGrid);

export default function QuoteBoard() {
  const {state} = useOvermind();

  useQuery(state.quote.queryList, {pollInterval: state.quote.pollInterval});

  return (
    <StyledQuoteBoard>
      <DataGrid/>
    </StyledQuoteBoard>
  );
}
