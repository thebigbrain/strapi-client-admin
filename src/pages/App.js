import React from 'react';
// import QuoteBoard from 'pages/QuoteBoard';
// import NavBar from "./NavBar";
// import Footer from "./Footer";
import {PageContainer} from 'components/elements';
import {useOvermind} from 'hooks/overmind';
import Layout from './Layout';

export default function App() {
  const {state} = useOvermind();
  return (
    <PageContainer>
      {/* <NavBar/>
      <QuoteBoard/>
      <Footer/> */}
      <Layout {...state.layout}/>
    </PageContainer>
  );
}
