import { createOvermind } from "overmind";
import { merge, namespaced } from "overmind/config";
import { graphql } from "overmind-graphql";

import effects from "./effects";
import { state } from "./state";
import * as actions from "./actions";
import { onInitialize } from "./onInitialize";
import * as queries from "./queries";
import * as mutations from "./mutations";

import quote from "./namespaces/quote";
import timer from "./namespaces/timer";
import layout from "./namespaces/layout";
import user from "./namespaces/user";
import collections from "./namespaces/collections";

// import warning from '../utils/warning
const location = window.location;

const config = merge(
  graphql(
    {
      onInitialize,
      effects,
      state,
      actions
    },
    {
      endpoint: `${location.protocol}//${location.hostname}:1337/graphql`,
      headers: state => {
        return state.token
          ? {
              authorization: `Bearer ${state.token || ""}`
            }
          : {};
      },
      options: {
        // credentials: 'include',
        mode: "cors"
      },
      queries,
      mutations
    }
  ),
  namespaced({
    quote,
    timer,
    layout,
    user,
    collections
  })
);

export default createOvermind(config, {
  logProxies: false,
  devtools: false
});
