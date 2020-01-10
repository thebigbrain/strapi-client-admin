import React, { useEffect } from 'react';
import { useOvermind } from 'hooks/index';


export default function GithubCallback(props) {
  const {pathname, search} = window.location;
  const {state} = useOvermind();

  useEffect(() => {
    window.fetch(`${state.strapiServerOrigin}${pathname}${search}`).then((r) => {
      return r.json();
    }).then(data => {
      window.opener.postMessage({type: 'signin', data}, '*');
    }).catch(e => {
      window.opener.postMessage({type: 'signin', data: {error: e}}, '*');
    });
  }, [pathname, search, state.strapiServerOrigin]);

  return null;
}
