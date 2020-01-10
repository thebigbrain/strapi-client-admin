const location = window.location;

export const state = {
  graphQLErrors: [],
  error: null,
  hasLoadedApp: false,
  navBar: {
    title: '期权报价板'
  },
  notice: '声明：以上价格为平值看涨（看跌）期权参考报价，名义本金在500万以内有效，更多报价欢迎来电咨询：021-20778915。',
  strapiServerOrigin: `${location.protocol}//${location.hostname}:1337`
};
