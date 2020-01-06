export const create = async ({effects, state}, data) => {
  const orderService = effects.api.getService('orders');
  await orderService.create(data);
};

export const addOrders = ({state, actions}, ...orders) => {
  state.order.orders.push(...orders);
  orders.forEach(order => {
    actions.createTransaction({payload: order, op: 'order.create'});
  });
};

export const initialize = async ({state, effects, actions}) => {
  const orderService = effects.api.getService('orders');
  orderService.on('created', (data) => {
    actions.order.addOrders(data);
  });

  const res = await orderService.find({
    query: {
      $limit: 10000
    }
  });

  state.order.orders = res.data;
};

export const deInitialize = ({effects, state}) => {
  const orderService = effects.api.getService('orders');
  orderService.off('created');
  state.order.orders = [];
};
