import React from 'react';
import { useTheme } from '@material-ui/styles';
import { Pagination } from 'antd';

export default function({
  gotoPage,
  // canPreviousPage,
  // canNextPage,
  // previousPage,
  // nextPage,
  // pageCount,
  // pageOptions,
  setPageSize,
  state: { pageIndex, pageSize },
  total,
}) {
  const theme = useTheme();

  return (
    <div style={theme.pagination}>
      <Pagination
        // hideOnSinglePage
        showSizeChanger
        showQuickJumper
        showLessItems
        showTotal={total => `共 ${total} 条数据`}
        onShowSizeChange={(current, size) => setPageSize(size)}
        onChange={(page, pageSize) => gotoPage(page - 1)}
        defaultCurrent={pageIndex + 1}
        total={total}
        pageSize={pageSize}
        pageSizeOptions={[1, 2, 10, 20, 30, 50, 100].map(String)}
      />
    </div>
    
  );
}