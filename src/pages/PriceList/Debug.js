import React, {useState, useEffect} from 'react'
import { Descriptions, Form, List, Input } from 'antd';
import { calcMargin } from './price'
import {
  calcElapsedMinutes,
  calcFzjfTime,
  getInstrumentConfig,
  getOfferModelSettingSync,
  preloadInstruments,
  preloadOfferModelSetting, toPercent,
} from './utils'
import { parseSinaOptionInfo } from '../../utils/utils'
import { calcOptionPrice } from '../../utils/price'
import moment from 'moment'

const downStyle = { color: '#3f8600' }
const upStyle = { color: '#cf1322' }

const cache = new Map();

const containerStyle = {
  display: 'flex',
  flexDirection: 'row',
  padding: '1px'
}

window.document.title = 'DEBUG'


function withInitial(promises = []) {
  return (C) => props => {
    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
      let aborted = false
      Promise.all(promises).then(() => {
        if (aborted) return
        setInitialized(true)
      }).catch(console.error)

      return () => {
        aborted = true
      }
    }, [])

    if (!initialized) return null

    return (<C {...props}/>)
  }
}

function Debug(props) {
  const [code, setCode] = useState(null)
  const [spot, setSpot] = useState(null)
  const [strike, setStrike] = useState(null)
  const [number, setNumber] = useState(1)
  const [latestPrice, setLatestPrice] = useState({})

  const handleStrike = (e) => {
    setStrike(e.target.value)
  }
  const handleCount = (e) => {
    setNumber(e.target.value)
  }

  const handleSpot = (e) => {
    setSpot(e.target.value)
  }

  useEffect(() => {
    if (!code) return
    let aborted = false

    getLatestPrice(code.instrumentCode).then((data) => {
      if (aborted) return
      setLatestPrice(data)
      setStrike(data.last_price)
      setSpot(data.last_price)
    })

    return () => {
      aborted = true
    }
  }, [code])

  return (
    <div style={containerStyle}>
      <CodeList onClick={setCode} onInit={setCode}/>
      <div style={{
        marginLeft: '160px',
        flexGrow: '1',
        padding: '15px'
      }}>
        {
          <Form>
            <Form.Item>
              <Input type='number' defaultValue={number} placeholder='头寸数量' onInput={handleCount} disabled/>
              <Input type='number' value={spot} placeholder='入场价' onInput={handleSpot}/>
              <Input type='number' value={strike} placeholder='执行价' onInput={handleStrike}/>
            </Form.Item>
          </Form>
        }

        {code && (
          <Content
            code={code}
            spot={spot}
            strike={strike}
            number={number}
            latestPrice={latestPrice}
          />
        )}
      </div>
    </div>
  )
}

export default withInitial([
  preloadInstruments(),
  preloadOfferModelSetting(),
  preloadCodeList()
])(Debug)

function Content(props) {
  const code = props.code

  let setting = getOfferModelSettingSync()
  let config = getInstrumentConfig(code.instrumentCode)
  // console.log(setting, config)
  if (!config) return <div>暂无数据({code.instrumentCode})</div>

  const [time, setTime] = useState(null)
  const [timer, setTimer] = useState(null)
  const [buyPrice, setBuyPrice] = useState(null)
  const [sellPrice, setSellPrice] = useState(null)
  const [margin, setMargin] = useState({})
  const latestPrice = props.latestPrice

  const setPriceTime = () => {
    let t = calcFzjfTime(setting.n, config.night_time, setting.yearTradTotal, config.total_minutes)
    setTime(t.toFixed(4))
    let buyPrice = calcOptionPrice(props.spot, props.strike, code.saleVolatility, setting.interestRate, t.toFixed(4), setting.holdingCost)
    setBuyPrice(buyPrice)
    let sellPrice = calcOptionPrice(props.spot, props.strike, code.buyVolatility, setting.interestRate, t.toFixed(4), setting.holdingCost)
    setSellPrice(sellPrice)
  }

  useEffect(() => {
    if (timer) clearInterval(timer)
    let id = setInterval(() => {
      setPriceTime()
    }, 2000)

    setTimer(id)
    setPriceTime()

    return () => timer && clearInterval(timer)
  }, [setting.n, config.night_time, setting.yearTradTotal, config.total_minutes, props.spot, props.strike, props.time, props.price])

  const deps = [
    latestPrice.settlement_price,
    config.d1,
    config.d2,
    code.buyVolatility,
    props.number,
    props.strike,
    setting.interestRate,
    setting.holdingCost
  ]

  useEffect(() => {
    const [s0, d1, d2, vol, n, k, r, b] = deps;
    if (!s0 || !k) return
    let c = calcMargin(1, s0, d1, d2, vol, n, k, setting.n / setting.yearTradTotal, r, 'call', b)
    let p = calcMargin(1, s0, d1, d2, vol, n, k, setting.n / setting.yearTradTotal, r, 'put', b)
    let margin = {call: c, put: p}
    setMargin(margin)
  }, deps)

  const elapsed = calcElapsedMinutes(config.night_time, config.total_minutes)

  return (
    <Descriptions title={code.instrumentCode} bordered>
      <Descriptions.Item label="最新价">{latestPrice.last_price}</Descriptions.Item>
      <Descriptions.Item label="入场价">{props.spot}</Descriptions.Item>
      <Descriptions.Item label="执行价">{props.strike}</Descriptions.Item>

      <Descriptions.Item label="交易天数">{setting.n}</Descriptions.Item>
      <Descriptions.Item label="夜间交易时间段">{config.night_time}</Descriptions.Item>
      <Descriptions.Item label="年交易天数">{setting.yearTradTotal}</Descriptions.Item>

      <Descriptions.Item label="日分钟数">{config.total_minutes}</Descriptions.Item>
      <Descriptions.Item label="到期日期" span={2}>{moment(setting.offerDate).format('YYYY-MM-DD')}</Descriptions.Item>

      <Descriptions.Item label="剩余时间(T - t)">{time}</Descriptions.Item>
      <Descriptions.Item label='今日已过分钟数' span={2}>{elapsed}</Descriptions.Item>

      <Descriptions.Item label='客户买入波动率'>{toPercent(code.saleVolatility)}</Descriptions.Item>
      <Descriptions.Item label="权利金(客户买入)" span={2}>
        Call: {buyPrice && buyPrice.call.toFixed(2)}
        <br/>
        Put: {buyPrice && buyPrice.put.toFixed(2)}
      </Descriptions.Item>

      <Descriptions.Item label="客户卖出波动率">{toPercent(code.buyVolatility)}</Descriptions.Item>
      <Descriptions.Item label="权利金(客户卖出)" span={2}>
        Call: {sellPrice && sellPrice.call.toFixed(2)}
        <br/>
        Put: {sellPrice && sellPrice.put.toFixed(2)}
      </Descriptions.Item>

      <Descriptions.Item label="最近一个交易日结算价">{latestPrice.settlement_price}</Descriptions.Item>
      <Descriptions.Item label="d1">{config.d1}</Descriptions.Item>
      <Descriptions.Item label="d2">{config.d2}</Descriptions.Item>

      <Descriptions.Item label="持仓的头寸数量">{props.number}</Descriptions.Item>
      <Descriptions.Item label="无风险利率">{setting.interestRate}</Descriptions.Item>
      <Descriptions.Item label="持有成本">{setting.holdingCost}</Descriptions.Item>

      <Descriptions.Item label="保证金(Call)" span={3}>
        T + 0: {margin.call && Number(margin.call.iMargin[0]).toFixed(3)}
        <br />
        {/*T + 1: {margin.call && Number(margin.call.iMargin[1]).toFixed(3)}*/}
        {/*<br/>*/}
        按上一个交易日结算价计算得到的权利金: {margin.call && margin.call.vs.cur.toFixed(3)}
        <br/>
        轧差后初始保证金: {margin.call && margin.call.rolledMargin.toFixed(3)}
      </Descriptions.Item>

      {/*<Descriptions.Item label="保证金(Put)" span={3}>*/}
        {/*3种: {margin.put && margin.put[0].tofixed(3)}*/}
        {/*<br />*/}
        {/*5种: {margin.put && margin.put[1].tofixed(3)}*/}
      {/*</Descriptions.Item>*/}

    </Descriptions>
  )
}

function CodeList(props) {
  const data = getCodeList().data
  const [selected, setSelected] = useState(data[0])

  const handleItemClick = (item) => {
    setSelected(item)
    if (props.onClick) props.onClick(item)
  }

  useEffect(() => {
    if (props.onInit) props.onInit(selected)
  }, [])

  const listStyle = {
    position: 'fixed',
    margin: '5px',
    width: '150px',
    height: 'calc(100vh - 12px)',
    textAlign: 'center',
    overflow: 'auto',
    cursor: 'pointer'
  }

  const selectedItemStyle = {
    background: '#333',
    color: '#fff'
  }

  return (
    <List
      style={listStyle}
      size="small"
      header={<div>标的名称</div>}
      bordered
      dataSource={data}
      renderItem={item => (
        <List.Item
          style={selected.id === item.id ? selectedItemStyle : {}}
          onClick={() => handleItemClick(item)}
        >
          {item.instrumentCode}
        </List.Item>
      )}
    />
  )
}

function getCodeList() {
  return cache.get('code.list')
}

async function preloadCodeList() {
  let url = 'http://fzjf.zhiweicloud.com/api/offerModel/openModelList?userName=admin'
  let r = await window.fetch(url)
  cache.set('code.list', await r.json())
}

async function getLatestPrice(code) {
  const key = `code.${code}`
  if (cache.has(key)) return cache.get(key)

  let r = await window.fetch(`/hqsn/rn=1574237637888&&list=${code}`)
  let data = await r.text()
  // return parseSinaOptionInfo(data)[0]
  cache.set(key, parseSinaOptionInfo(data)[0])
  return cache.get(key)
}
