import React from "react";
import { styled } from "@material-ui/styles";
import { Layout, Menu, Icon, Skeleton } from "antd";
import { useOvermind } from "hooks/overmind";
import { Switch, Route, Link } from "react-router-dom";
import { FlexPadding } from "components/elements";

import User from "./User";

import Home from "./dynamic/Home";
import Board from "./dynamic/Board";
import CodeList from "./dynamic/CodeList";
import SchemaForm from "./dynamic/SchemaForm";
import JsonEditor from "./dynamic/JsonEditor";
import Table from './dynamic/Table';


const StyledLayout = styled(Layout)({
  width: "100%",
  height: "100%"
});

const Logo = styled("div")({
  height: 32,
  background: "rgba(255, 255, 255, 0.2)",
  margin: 16
});

const pages = { Home, Board, CodeList, SchemaForm, JsonEditor, Table };

function renderMenu(route, prefix) {
  const routes = route.routes;

  return (
    routes &&
    routes.map(v => {
      const path = v.path === "/" ? prefix : `${prefix}/${v.path}`;

      if (v.routes && v.routes.length > 0) {
        return (
          <Menu.SubMenu
            key={path}
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
        <Menu.Item key={path}>
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

  if (routes && routes.length > 0) {
    return routes.map(r => renderRoutes(r, path));
  }

  if (!route.component) return <div>null component: {path}</div>;

  const OtherComponent = pages[route.component];
  return (
    <Route
      key={path}
      path={path}
    >
      <OtherComponent {...(route.props && JSON.parse(route.props))} />
    </Route>
  );
}

function HeaderButtons(props) {
  return <User />;
}

function _Layout(props) {
  const { state, actions } = useOvermind();
  // @ts-ignore
  const { route, collapsed } = state.layout;

  if (!route) return <Skeleton active />;

  // @ts-ignore
  const { toggleCollapsed } = actions.layout;
  const prefix = "/" + route.path.replace(/\/$/, "");

  let selected = [window.location.pathname];
  let opened = selected.map(v => {
    let arr = v.split("/");
    arr.pop();
    return arr.join("/");
  });

  return (
    <StyledLayout>
      <Layout.Sider trigger={null} collapsible collapsed={collapsed}>
        <Logo />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={selected}
          defaultOpenKeys={opened}
        >
          {renderMenu(route, prefix)}
        </Menu>
      </Layout.Sider>
      <Layout>
        <Layout.Header style={{ background: "#fff" }}>
          <Icon
            type={collapsed ? "menu-unfold" : "menu-fold"}
            onClick={toggleCollapsed}
          />
          <FlexPadding />
          <HeaderButtons />
        </Layout.Header>
        <Layout.Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff",
            minHeight: 280
          }}
        >
          <Switch>{renderRoutes(route, "")}</Switch>
        </Layout.Content>
      </Layout>
    </StyledLayout>
  );
}

export default function() {
  const { actions } = useOvermind();
  // @ts-ignore
  actions.getApp();
  // actions.getRoutes();

  // eslint-disable-next-line react/jsx-pascal-case
  return <_Layout />;
}
