import React from "react";
import {NoticeBar} from "antd-mobile";
import {useOvermind} from "../hooks";

export default function () {
  const {state} = useOvermind();

  return (
    <div>
      <NoticeBar marqueeProps={{loop: true, style: {padding: '0 7.5px'}}}>
        {state.notice}
      </NoticeBar>
    </div>
  );
}