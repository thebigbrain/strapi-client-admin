import { parseSinaOptionInfo } from '../../utils/utils'
import { calcOptionPrice } from '../../utils/price'
import { calcFzjfTime, getOfferModelSetting, preloadInstruments, getInstrumentConfig, toFixed, toPercent } from './utils'

export async function calcPriceModel(list, modelPrice, endDate, data, userName) {
  let modelSetting = await getOfferModelSetting(userName);
  await preloadInstruments();

  let modelPrice1 = {};
  const latestPrice = parseSinaOptionInfo(data);
  const tmp = list.map((model)=>{
    const price = latestPrice.filter((item)=>item.code===model.instrumentCode);
    let config = getInstrumentConfig(model.instrumentCode)

    if(config && price && price.length > 0 && price[0].last_price){
      const tmpPrice = modelPrice[model.instrumentCode];
      if (price[0].last_price > price[0].pro_price) {
        if (tmpPrice && tmpPrice !== price[0].last_price) {
          model.backgroundColor = 'rgba(239, 83, 80, 0.2)'
        } else {
          model.backgroundColor = 'transparent'
        }
      } else {
        if (tmpPrice && tmpPrice !== price[0].last_price) {
          model.backgroundColor = 'rgba(38, 166, 154, 0.2)'
        } else {
          model.backgroundColor = 'transparent'
        }
      }
      model.latestPrice = toFixed(price[0].last_price, config.afterpoint, config.tick);
      model.proPrice = price[0].pro_price;
      modelPrice1[model.instrumentCode] =  price[0].last_price;
      const futures = price[0].last_price;
      const strike = price[0].last_price;
      const sigmaBuy = model.buyVolatility;
      const sigmaSell= model.saleVolatility;
      const riskfreerate = model.interestRate;

      let {night_time, total_minutes} = config || {}
      let time = calcFzjfTime(modelSetting.n, night_time, modelSetting.yearTradTotal, total_minutes);

      const unitRoyalties1 = calcOptionPrice(futures,strike,sigmaBuy,riskfreerate,time, modelSetting.holdingCost);
      const unitRoyalties2 = calcOptionPrice(futures,strike,sigmaSell,riskfreerate,time, modelSetting.holdingCost);
      model.buyPrice = unitRoyalties1.call? toFixed(unitRoyalties1.call):'---';
      model.sellPrice= unitRoyalties2.call? toFixed(unitRoyalties2.call):'---';
      model.buyVol = toPercent(model.buyVolatility);
      model.sellVol = toPercent(model.saleVolatility);
      model.buyPercent= model.buyPrice !== '---' && model.latestPrice > 0 ? toPercent(model.buyPrice / model.latestPrice):'---';
      model.sellPercent= model.sellPrice !== '---' && model.latestPrice > 0 ? toPercent(model.sellPrice / model.latestPrice):'---';

      if(!!endDate){
        if(!endDate.isSame(modelSetting.offerDate, 'day')){
          model.buyPrice = '---';
          model.sellPrice= '---';
          model.buyPercent= '___';
          model.sellPercent= '___';
          model.buyVol= '___';
          model.sellVol= '___';
          return model;
        }
      }
    } else {
      model.latestPrice = '---';
      model.buyPrice = '---';
      model.sellPrice= '---';
      model.buyPercent= '___';
      model.sellPercent= '___';
      model.buyVol= '___';
      model.sellVol= '___';
    }

    return model;
  });

  return {tmp,modelPrice1}
}

export function calcMargin(A, s0, d1, d2, volatility, n, K, t, r, callput = 'call', b = 0) {
  if (A == null) A = 1;
  let a1 = d1;
  let a2u = (1 + d1) * (1 + d2) - 1;
  let a2d = (1 - d1) * (1 - d2) - 1;
  let s = {
    cur: s0,
    prev: (1 - a1) * s0,
    next: (1 + a1) * s0,
    cn1: (1 + a2d) * s0,
    cn2: (1 + a2u) * s0,
  };
  let vs = {};
  for (let k in s) {
    vs[k] = calcOptionPrice(s[k], K, volatility, r, t, b)[callput]
  }

  let mv = [Math.max(vs.cur, vs.prev, vs.next), Math.max(...Object.values(vs))];

  let mMargin = mv.map(v => v * A);
  let iMargin = mMargin.map(v => v * 1.1);
  const rolledMargin = iMargin[0] - vs.cur

  return { iMargin, mMargin, mv, a2u, a2d, s, vs, rolledMargin };
}

// const result = calcMargin(1, 4988.00, 0.05, 0.05, 1.2 * 0.30, 1000, 5000, 20/252, 0.001);
// const {iMargin, mMargin, vs} = result;
// console.log(result);
// console.log(
//   mMargin[0].toFixed(3), 346.948, iMargin[0].toFixed(3), 381.643,
//   (iMargin[0] - vs.cur).toFixed(3), 211.643, vs.cur, 168.520, result.rolledMargin
// );
// console.log(calcOptionPrice(5000, 5000, 0.3, 0.001, 20 / 252, 0).call, 168.520)

console.log(calcOptionPrice(3618, 3700, 0.2023, 0.06, 20 / 252, 0).call.toFixed(2), 48.3)
console.log(calcOptionPrice(3618, 3550, 0.2038, 0.06, 20 / 252, 0).call.toFixed(2), 119.95)
