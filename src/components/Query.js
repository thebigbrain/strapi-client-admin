import {useQuery} from '@apollo/client';
import React from 'react';

export default function({query, action, option, children, ...rest}){
  const {loading, error, data} = useQuery(query, Object.assign({pollInterval: 3000}, option));

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  if (action) action(data);

  return React.cloneElement(React.Children.only(children), rest);
};
