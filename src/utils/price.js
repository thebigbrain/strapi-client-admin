/**
 * @return {number}
 */
function Normal(z) {
  return Math.exp((-1 * z * z) / 2) / Math.sqrt(2 * Math.PI);
}

/**
 * @return {number}
 */
function NormDist(z) {
  if (z > 6) return 1;
  if (z < -6) return 0;
  let gamma = 0.2316419,
    a1 = 0.31938153,
    a2 = -0.356563782,
    a3 = 1.781477937,
    a4 = -1.821255978,
    a5 = 1.330274429;
  let k = 1 / (1 + Math.abs(z) * gamma);
  let n = k * (a1 + k * (a2 + k * (a3 + k * (a4 + k * a5))));
  n = 1 - Normal(z) * n;
  if (z < 0) return 1 - n;
  return n;
}

/**
 * @return {number}
 */
function calcD1(futures, sigma, strike, time, b = 0) {
  let L01 = Math.log(futures / strike);
  let L02 = (b + Math.pow(sigma, 2) / 2) * time;
  let L03 = sigma * Math.sqrt(time);
  return (L01 + L02) / L03;
}

/**
 * @return {number}
 */
function calcD2(d1, sigma, dT_t) {
  let L03 = sigma * Math.sqrt(dT_t);
  return d1 - L03;
}

/*
 * @param futures - 当前标的价格          S
 * @param sigma - 年波动率 < 1.0       σ(sigma)
 * @param risk free rate - 修正的无风险利率         r
 * @param strike - 执行价（元）          X
 * @param time - 到期时间(年)         time，比如剩余天数为1，则为 1/365
 */
function calcD(futures, strike, sigma, riskfreerate, time, b = 0) {
  let K = strike,
    F = futures;
  let d1 = calcD1(futures, sigma, strike, time, b);
  let d2 = calcD2(d1, sigma, time);
  let dfb = Math.exp((b - riskfreerate) * time);
  let df = Math.exp((0 - riskfreerate) * time);
  return {d1, d2, df, dfb, K, F};
}

/**
 * 认购期权理论价
 * @return {number} - 认购期权理论价
 */
function calcCall(d1, d2, df, dfb, K, F) {
  return dfb * F * NormDist(d1) - df * K * NormDist(d2);
}

/**
 * 认沽期权理论价
 * @return {number} -认沽期权理论价
 */
function calcPut(d1, d2, df, dfb, K, F) {
  return df * K * NormDist(-1 * d2) - dfb * F * NormDist(-1 * d1);
}

function calcOptionPrice(futures, strike, sigma, riskfreerate, time, b = 0) {
  let {d1, d2, df, dfb, K, F} = calcD(
    Number(futures),
    Number(strike),
    Number(sigma).toFixed(4),
    Number(riskfreerate),
    Number(time),
    Number(b)
  );
  // console.log(d1,d2,df,K,F)
  return {call: calcCall(d1, d2, df, dfb, K, F), put: calcPut(d1, d2, df, dfb, K, F)};
}

function calcPriceDelta(futures, strike, sigma, riskfreerate, time, isCall, b = 0) {
  let {d1, d2, df, dfb, K, F} = calcD(Number(futures), Number(strike), Number(sigma), Number(riskfreerate), Number(time), Number(b));
  let delta, price;
  if (isCall) {
    delta = Math.exp(-1 * riskfreerate * time) * NormDist(d1);
    price = calcCall(d1, d2, df, dfb, K, F);
  } else {
    delta = Math.exp(-1 * riskfreerate * time) * (NormDist(d1) - 1);
    price = calcPut(d1, d2, df, dfb, K, F);
  }

  return {price, delta};
}

// 计算用black参https://www.glynholton.com/notes/black_1976/
function calcGreeks(futures, strike, sigma, riskfreerate, time, type) {
  let d1 = calcD1(futures, sigma, strike, time);
  let d2 = calcD2(d1, sigma, time);
  let gama = (Math.exp(-1 * riskfreerate * time) * Normal(d1)) / futures / sigma / Math.sqrt(time);
  let vega = futures * Math.exp(-1 * riskfreerate * time) * Normal(d1) * Math.sqrt(time);
  let {call, put} = calcOptionPrice(futures, strike, sigma, riskfreerate, time);
  // 类型为put的计算
  let delta = Math.exp(-1 * riskfreerate * time) * (NormDist(d1) - 1);
  let theta =
    (-Math.exp(-1 * riskfreerate * time) * futures * Normal(d1) * sigma) / 2 / Math.sqrt(time) -
    riskfreerate * futures * Math.exp(-1 * riskfreerate * time) * NormDist(-d1) +
    riskfreerate * strike * Math.exp(-1 * riskfreerate * time) * NormDist(-d2);
  let rho = -time * put;
  if (type === 'C') {
    delta = Math.exp(-1 * riskfreerate * time) * NormDist(d1);
    theta =
      (-Math.exp(-1 * riskfreerate * time) * futures * Normal(d1) * sigma) / 2 / Math.sqrt(time) +
      riskfreerate * futures * Math.exp(-1 * riskfreerate * time) * NormDist(d1) -
      riskfreerate * strike * Math.exp(-1 * riskfreerate * time) * NormDist(d2);
    rho = -time * call;
  }
  return {delta: delta, gama: gama, vega: vega, theta: theta, rho: rho};
}

function calcMargin(S, K, n, margin_ratio, isCall) {
  S = Math.round(Number(S) * 100);
  K = Math.round(Number(K) * 100);
  margin_ratio = Math.round(Number(margin_ratio) * 100) + 1;
  let V = K - S;
  V = isCall ? Math.max(V, 0) : Math.max(-V, 0);
  V = V * n;
  let T = Math.round((S * n * margin_ratio) / 100);
  let margin = Math.round(0.5 * V);
  return Math.max(T - margin, margin) / 100;
}

function calcMarginGhls(S, K, n, sigma, riskfreerate, time, isCall, margin_ratio, latest_price) {
  console.log(S, K, n, sigma, riskfreerate, time, isCall, margin_ratio, latest_price);
  let {delta, price} = calcPriceDelta(S, K, sigma, riskfreerate, time, isCall);
  return n * (price + (margin_ratio + 2 * sigma) * Math.max(Math.abs(delta), .2) * latest_price);
}


/**
 * 平值期权日期(n个工作日后)
 */
// eslint-disable-next-line no-unused-vars
function getWorkDate(startDate, limitDay) {
  const startTime = startDate.getTime();
  const T = 24 * 60 * 60 * 1000;
  const endTime = startTime + (limitDay * T);
  if (limitDay > 0) {
    let weekend = 0;
    for (let i = startTime + T; i <= endTime; i += T) {
      const date = new Date(i);
      if (date.getDay() === 0 || date.getDay() === 6) {
        weekend++;
      }
    }
    return getWorkDate(new Date(endTime), weekend);
  } else {
    return startDate;
  }
}

/**
 *  平值期权（求取第几个工作日）
 * @returns {number}
 */
// eslint-disable-next-line no-unused-vars
function getN(startDate, endDate) {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const T = 24 * 60 * 60 * 1000;
  let day = 0;
  for (let i = startTime + T; i <= endTime; i += T) {
    const date = new Date(i);
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      day++;
    }
  }
  return day;
}

/**
 * 计算时间
 * @param d
 */
function calcTimeDiff(d) {
  const currDate = new Date();
  const currDate1 = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDay(), 15, 0, 0);
  // console.log('curr:',currDate1.toString());
  const endDate = new Date(d);
  // console.log('endd:',endDate.toString(),endDate.getDay());
  let time = Math.abs(endDate.getTime() - currDate1.getTime()) / (3600 * 1000 * 24);
  if (currDate.getTime() <= currDate1.getTime()) {
    time = time + 1;
  }
  // console.log('time:',time);
  return time / 365.0;
}

module.exports = {
  calcOptionPrice,
  calcMargin,
  calcTimeDiff,
  calcGreeks,
  calcMarginGhls,
  calcPriceDelta
};
