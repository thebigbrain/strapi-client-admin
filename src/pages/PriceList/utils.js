import moment from 'moment'

const globalCache = new Map();

export async function getOptionTime(maturity, now = moment().format('YYYY-MM-DD')) {
  if (typeof maturity !== 'string') {
    maturity = moment(maturity).format('YYYY-MM-DD')
  }
  if (typeof now !== 'string') {
    now = moment(now).format('YYYY-MM-DD')
  }

  const host = window.location.hostname === 'localhost' ? 'http://option.zhiweicloud.com' : ''
  let res = await fetch(`${host}/api/date/calDate?startTime=${now}&endTime=${maturity}`)
  let data = await res.json()

  return data.data[0]
}

export async function getOfferModelSetting(userName = 'admin') {
  const k = `offermodel.offermodelsetting.${userName}`
  if (globalCache.has(k)) {
    return globalCache.get(k)
  }

  let r = await window.fetch(`http://fzjf.zhiweicloud.com/api/offerModel/offerModelSetting?userName=${userName}`)
  let data = await r.json()
  globalCache.set(k, data.data)
  return globalCache.get(k)
}

export const preloadOfferModelSetting = getOfferModelSetting

export function getOfferModelSettingSync(userName = 'admin') {
  const k = `offermodel.offermodelsetting.${userName}`
  return globalCache.get(k)
}

export async function preloadInstruments () {
  if (!globalCache.has('instruments.config')) {
    const url = 'https://wyun-public.oss-cn-hangzhou.aliyuncs.com/futuresinfo/futures_info.json';
    let r = await fetch(url);
    let data = await r.json();
    data.RECORDS.forEach(v => {
      globalCache.set(`instruments.config.${v.symbol}`, v);
    });
    globalCache.set('instruments.config', data.RECORDS);
  }
  return globalCache;
}

export function getInstrumentConfig(code) {
  let s = getSymbol(code)
  return globalCache.get(`instruments.config.${s}`);
}

function calcFzjfElapsed(night_range, a_day) {
  let now = moment();
  if (!night_range) night_range = '21:00-21:00';
  night_range = night_range.split('-').map(v => v.split(':'));

  let s_0 = moment({hour: 0, minute: 0, seconds: 0, milliseconds: 0});
  let s_9 = moment({hour: 9, minute: 0, seconds: 0, milliseconds: 0});
  let s_1015 = moment({hour: 10, minute: 15, seconds: 0, milliseconds: 0});
  let s_1030 = moment({hour: 10, minute: 30, seconds: 0, milliseconds: 0});
  let s_1130 = moment({hour: 11, minute: 30, seconds: 0, milliseconds: 0});
  let s_1330 = moment({hour: 13, minute: 30, seconds: 0, milliseconds: 0});
  let s_15 = moment({hour: 15, minute: 0, seconds: 0, milliseconds: 0});
  let s_ns = moment({hour: night_range[0][0], minute: night_range[0][1], seconds: 0, milliseconds: 0});
  let s_ne = moment({hour: night_range[1][0], minute: night_range[1][1], seconds: 0, milliseconds: 0});
  let s_24 = moment({hour: 24, minute: 0, seconds: 0, milliseconds: 0});

  let elapsed = 0;

  if (now > s_ns) {
    elapsed = a_day;
    if (s_ne < s_ns || now < s_ne) return elapsed + now - s_ns;
    else return elapsed + s_ne - s_ns;
  } else {
    elapsed = s_ne < s_ns ? s_ne - s_0 + s_24 - s_ns : s_ne - s_ns;
  }

  if (now < s_9) {
    return elapsed;
  }

  if (now < s_1015) {
    elapsed += now - s_9;
    return elapsed;
  } else {
    elapsed += s_1015 - s_9;
  }

  if (now < s_1030) {
    return elapsed;
  }

  if (now < s_1130) {
    elapsed += now - s_1030;
    return elapsed;
  } else {
    elapsed += s_1130 - s_1030;
  }

  if (now < s_1330) {
    return elapsed;
  }

  if (now < s_15) {
    elapsed += now - s_1330;
    return elapsed;
  } else {
    elapsed += s_15 - s_1330;
  }

  return elapsed;
}

export function calcElapsedMinutes(night_range, minutes = 225) {
  let a_day = minutes * 60 * 1000;
  let elapsed = calcFzjfElapsed(night_range, a_day);
  return parseInt(elapsed / (60 * 1000))
}

export function calcFzjfTime(time, night_range, days = 252, minutes = 225) {
  if (!night_range) night_range = '21:00-21:00';
  if (!minutes) minutes = 225;
  if (!days) days = 252;

  time++;

  let a_day = minutes * 60 * 1000;

  let elapsed = calcFzjfElapsed(night_range, a_day);
  elapsed = Number(elapsed / a_day).toFixed(2);

  return (time - elapsed) / days;
}

export function toPercent(v, fixed = 2) {
  return Number(100 * v).toFixed(fixed) + '%'
}

export function toFixed(v, fixed = 2, tick = 1) {
  // console.log(fixed, tick)
  // if (!fixed) fixed = 2;
  // if (!tick) tick = 1;
  return Number(parseInt(v / tick) * tick).toFixed(fixed)
}

export function getSymbol(code) {
  return code.substr(0, code.search(/[0-9]/))
}

export const calcVol = (spot, strike, model) => {
  const {
    buyVolatility, buyVolatilityLower, buyVolatilityUpper,
    saleVolatility, saleVolatilityLower, saleVolatilityUpper,
    lowerRatio: lower, upperRatio: upper
  } = model
  let buyVol = [buyVolatility, buyVolatilityLower, buyVolatilityUpper]
  let sellVol = [saleVolatility, saleVolatilityLower, saleVolatilityUpper,]

  let i = strike > spot ? 2 : 1
  let base = strike > spot ? upper : lower

  let bRatio = (buyVol[i] - buyVol[0]) / (base - 1)
  let sRatio = (sellVol[i] - sellVol[0]) / (base - 1)

  return {
    buy: bRatio * (strike / spot - 1) + buyVolatility,
    sell: sRatio * (strike / spot - 1) + saleVolatility,
  }
}
