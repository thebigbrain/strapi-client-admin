import React from 'react';
import ProLayout from '@ant-design/pro-layout';
// import QuoteBoard from 'pages/QuoteBoard';
// import NavBar from "./NavBar";
// import Footer from "./Footer";
import {PageContainer} from 'components/elements';
import {useOvermind} from 'hooks/overmind';

import '@ant-design/pro-layout/es/BasicLayout.less';

export default function App() {
  const {state} = useOvermind();
  return (
    <PageContainer>
      {/* <NavBar/>
      <QuoteBoard/>
      <Footer/> */}
      <ProLayout {...state.layout}/>
    </PageContainer>
  );
}
