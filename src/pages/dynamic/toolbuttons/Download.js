import React from 'react';
import { Button } from 'antd';
import { useOvermind } from 'hooks';

export default function({id, collection, title, name, ...rest}) {
  const {actions} = useOvermind();

  return (
    <Button {...rest} title={title} onClick={() => actions.collections.download(collection)}>{name}</Button>
  );
}