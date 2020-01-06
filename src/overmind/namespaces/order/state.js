export const state = {
  orders: [],
  myOrders: (state, rootState) => state.orders.filter(order => order.orderStatus !== 1),
  rejectedOrders: (state) => state.orders.filter(order => order.orderStatus === 1),
  uncompletedOrders: (state) => state.orders.filter(order => ![1, 3].includes(order.orderStatus)),
  pendingOrders: (state) => state.orders.filter(order => order.orderStatus === 3),
};
