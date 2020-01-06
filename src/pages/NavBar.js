import {NavBar} from "antd-mobile";
import React from "react";
import {useOvermind} from "../hooks";

export default function () {
  const {state} = useOvermind();

  return (
    <NavBar>{state.navBar.title}</NavBar>
  );
}