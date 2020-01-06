const route = {
  path: '/',
  routes: [
    {
      path: 'board',
      name: '报价板'
    },
    {
      path: 'model',
      name: '模型管理'
    },
    {
      path: 'code-list',
      name: '标的管理'
    }
  ]
};

export const state = {
  locale: 'zh-CN',
  route,
  collapsed: false
};
