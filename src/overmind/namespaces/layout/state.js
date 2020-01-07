const route = {
  path: "admin",
  routes: [
    {
      icon: "home",
      path: "home",
      name: "主页",
      component: "Home"
    },
    {
      path: "board",
      name: "报价板",
      icon: "user",
      routes: [
        {path: 'b1', name: '报价板子目录1', component: "Board",},
        {path: 'b2', name: '报价板子目录2', component: "JsonEditor",},
      ]
    },
    {
      icon: "form",
      path: "model",
      name: "模型管理",
      component: "SchemaForm",
      props: {
        collection: "models",
        fields: [
          { type: "date", name: "begin", label: "起始日" },
          { type: "date", name: "expiry", label: "到期日" },
          { type: "number", name: "holding_cost", label: "持有成本" },
          { type: "number", name: "risk_free_rate", label: "利率" },
          { type: "number", name: "sigma", label: "波动率" }
        ],
        submit: "提交",
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 12 }
        }
      }
    },
    {
      icon: "upload",
      path: "codelist",
      name: "标的管理",
      component: "CodeList"
    },
    {
      icon: "setting",
      path: "jsoneditor",
      name: "布局配置",
      component: "JsonEditor"
    }
  ]
};

export const state = {
  locale: "zh-CN",
  route,
  collapsed: false,
  defaultSelectedKeys: [route.routes[0].path]
};
