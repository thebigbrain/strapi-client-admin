import React from "react";
import ReactDOM from "react-dom";
import App from "pages/App";
import { OvermindProvider } from "./hooks";
import * as serviceWorker from "./serviceWorker";
import overmind from "./overmind";
import { createGlobalStyle } from "styled-components";
import 'antd/dist/antd.css';
import {BrowserRouter as Router} from 'react-router-dom';
import {ApolloProvider} from "./graphql/client";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    }

    code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
        monospace;
    }
`;

ReactDOM.render(
  <OvermindProvider value={overmind}>
    <ApolloProvider>
      <GlobalStyle />
      <Router>
        <App />
      </Router>
    </ApolloProvider>
  </OvermindProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
