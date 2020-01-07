import React from "react";
import styled from "styled-components";
import { Layout, Menu, Icon } from "antd";
import { useOvermind } from "hooks/overmind";
import { Switch, Route, Link, useRouteMatch } from "react-router-dom";
import Home from "./dynamic/Home";
import Board from "./dynamic/Board";
import CodeList from "./dynamic/CodeList";
import SchemaForm from "./dynamic/SchemaForm";
import JsonEditor from "./dynamic/JsonEditor";

const StyledLayout = styled(Layout)`
  width: 100%;
  height: 100%;
`;

const Logo = styled.div`
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
`;

const pages = { Home, Board, CodeList, SchemaForm, JsonEditor };

function renderMenu(route, prefix) {
  const routes = route.routes;

  return (
    routes &&
    routes.map(v => {
      const path = v.path === "/" ? prefix : `${prefix}/${v.path}`;

      if (v.routes) {
        return (
          <Menu.SubMenu
            key="sub1"
            title={
              <span>
                {v.icon && <Icon type={v.icon} />}
                <span>{v.name}</span>
              </span>
            }
          >
            {renderMenu(v, path)}
          </Menu.SubMenu>
        );
      }

      return (
        <Menu.Item key={v.path}>
          <Link to={path}>
            {v.icon && <Icon type={v.icon} />}
            <span>{v.name}</span>
          </Link>
        </Menu.Item>
      );
    })
  );
}

function renderRoutes(route, prefix) {
  const routes = route.routes;
  const path = route.path ? `${prefix}/${route.path}` : prefix;

  if (routes) {
    return routes.map(r => renderRoutes(r, path));
  }

  if (!route.component) return <div>null component: {path}</div>;

  const OtherComponent = pages[route.component];
  return (
    <Route
      key={path}
      path={path}
      render={() => <OtherComponent {...route.props} />}
    />
  );
}

export default function(props) {
  const { state, actions } = useOvermind();
  const prefix = '/' + state.layout.route.path.replace(/\/$/, "");

  let match = useRouteMatch(`${prefix}/:selected`);
  let selected = match
    ? [match.params.selected]
    : state.layout.defaultSelectedKeys;

  console.log(selected)

  return (
    <StyledLayout>
      <Layout.Sider
        trigger={null}
        collapsible
        collapsed={state.layout.collapsed}
      >
        <Logo />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={selected}>
          {renderMenu(state.layout.route, prefix)}
        </Menu>
      </Layout.Sider>
      <Layout>
        <Layout.Header style={{ background: "#fff" }}>
          <Icon
            className="trigger"
            type={state.layout.collapsed ? "menu-unfold" : "menu-fold"}
            onClick={actions.layout.toggleCollapsed}
          />
        </Layout.Header>
        <Layout.Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff",
            minHeight: 280
          }}
        >
          <Switch>{renderRoutes(state.layout.route, '')}</Switch>
        </Layout.Content>
      </Layout>
    </StyledLayout>
  );
}
