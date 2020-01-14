import { createOvermind } from "overmind";
import { merge, namespaced } from "overmind/config";

import effects from "./effects";
import { state } from "./state";
import * as actions from "./actions";
import { onInitialize } from "./onInitialize";

import quote from './namespaces/quote';
import timer from './namespaces/timer';
import layout from './namespaces/layout';
import user from './namespaces/user';
import collections from './namespaces/collections';

// import warning from '../utils/warning

const config = merge(
  {
    onInitialize,
    effects,
    state,
    actions
  },
  namespaced({
    quote,
    timer,
    layout,
    user,
    collections,
  })
);

export default createOvermind(config, {
  logProxies: false,
  devtools: false
});
