import React from "react";
import { styled } from "@material-ui/styles";
import { useOvermind } from "hooks/index";
import { Alert, notification } from "antd";

const StyledError = styled(Alert)({
  position: 'relative',
  boxSizing: 'border-box',
  border: 0
});

export default function(props) {
  const { state } = useOvermind();

  if (state.graphQLErrors) {
    state.graphQLErrors.forEach(e => {
      notification.error({message: '请求错误', description: e.message});
    });
  }

  return state.error ? <StyledError message={state.error.message} type='error' showIcon closable/> : null;
}
