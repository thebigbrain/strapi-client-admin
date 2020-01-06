import React from "react";
import styled from 'styled-components';
import { Layout, Menu, Icon } from "antd";
import { useOvermind } from "hooks/overmind";

const StyledLayout = styled(Layout)`
  width: 100%;
  height: 100%;
`;

const Logo = styled.div`
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
`;

export default function(props) {
  const { state, actions } = useOvermind();

  return (
    <StyledLayout>
      <Layout.Sider trigger={null} collapsible collapsed={state.layout.collapsed}>
        <Logo/>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1">
            <Icon type="user" />
            <span>nav 1</span>
          </Menu.Item>
          <Menu.Item key="2">
            <Icon type="video-camera" />
            <span>nav 2</span>
          </Menu.Item>
          <Menu.Item key="3">
            <Icon type="upload" />
            <span>nav 3</span>
          </Menu.Item>
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
          Content
        </Layout.Content>
      </Layout>
    </StyledLayout>
  );
}
