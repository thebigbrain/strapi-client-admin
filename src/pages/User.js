import React from "react";
import { useOvermind } from "hooks/index";
import { Popover, Icon, List, Button } from "antd";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  popover: {
    "& .ant-popover-inner-content": {
      padding: "5px 0"
    }
  },
  listitem: {
    padding: "4px 16px",
    "&:hover": {
      cursor: "pointer"
    }
  }
});

function UserActions(props) {
  const {actions} = useOvermind();

  const classes = useStyles();

  return (
    <List
      size="small"
    >
      <List.Item className={classes.listitem} onClick={actions.user.logout}>退出登录</List.Item>
    </List>
  );
}

function User(props) {
  const {
    state: { user },
    actions
  } = useOvermind();
  const classes = useStyles();

  return user.jwt ? (
    <Popover
      overlayClassName={classes.popover}
      placement="bottomRight"
      content={<UserActions />}
      trigger="click"
    >
      <Icon type="user" theme="outlined" />
    </Popover>
  ) : (
    <React.Fragment>
      {/* <Button onClick={actions.user.loginWithGithub}>Github登录</Button> */}
      <Button onClick={actions.user.login}>登录</Button>
    </React.Fragment>
    
  );
}

export default User;
