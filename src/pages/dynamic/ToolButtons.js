import React from "react";
import { useOvermind } from "hooks";
import { Button } from "antd";
import Upload from "./toolbuttons/Upload";
import Download from './toolbuttons/Download'

const DefaultComponent = props => <Button {...props}>{props.name}</Button>;

const OpComponents = {
  upload: Upload,
  download: Download
};

export default function({collection}) {
  const { state } = useOvermind();
  const collection_ops = state.collectionConfigs[collection] || [];

  if (!collection_ops) return null;

  return collection_ops.map((tool, i) => {
    let C = OpComponents[tool.component.toLowerCase()] || DefaultComponent;
    return <C style={{marginLeft: '6px'}} key={tool.id} title={tool.title} {...tool} />;
  });
}
