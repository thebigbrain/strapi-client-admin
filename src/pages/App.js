import React from "react";
import { PageContainer } from "components/elements";
import Layout from "./Layout";
import AuthGithubCallback from "./AuthGithubCallback";
import { Switch, Route } from "react-router-dom";
import Error from './Error';

export default function App() {
  const { pathname } = window.location;

  return (
    <PageContainer>
      <Error/>
      {pathname.startsWith("/auth") ? (
        <Switch>
          <Route exact path="/auth/github/callback">
            <AuthGithubCallback />
          </Route>
        </Switch>
      ) : (
        <Layout />
      )}
    </PageContainer>
  );
}
