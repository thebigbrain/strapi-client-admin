import { createOvermind } from "overmind";
import { merge, namespaced } from "overmind/config";

import effects from "./effects";
import { state } from "./state";
import * as actions from "./actions";
import { onInitialize } from "./onInitialize";

import quote from './namespaces/quote';
import timer from './namespaces/timer';

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
    timer
  })
);

export default createOvermind(config, {
  devtools: false
});
