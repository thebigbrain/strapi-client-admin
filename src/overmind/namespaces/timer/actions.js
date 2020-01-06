export const updateTimer = ({state}, key) => {
  state.timer[key] = state.timer[key] + 1;
};