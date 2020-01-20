import React from 'react';
import { Button } from 'antd';

export default function({id, title, name, ...rest}) {
  const handleClick = () => {

  };

  return (
    <Button {...rest} title={title} onClick={handleClick}>{name}</Button>
  );
}