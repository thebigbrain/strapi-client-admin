import React, { useEffect, useState } from 'react'
import { PageHeader, Select, Form, Table } from 'antd'
import style from './style.less'
import router from 'umi/router'
import DatePicker from './DatePicker'
import moment from 'moment'
import { connect } from 'dva'
import { calcOptionPrice } from '../../utils/price'
import LocalModal from './LocalModal'
import { calcFzjfTime, getInstrumentConfig, getOfferModelSetting, preloadInstruments, toFixed } from './utils'
import { parseSinaOptionInfo } from '../../utils/utils'
import {toPercent} from './utils'


function getPrice(price, strike, buyVol, sellVol, rate, time, b, tick, fixed) {
  strike = toFixed(strike, fixed, tick)
  let buyOption = calcOptionPrice(price, strike, buyVol, rate, time, b)
  let sellOption = calcOptionPrice(price, strike, sellVol, rate, time, b)

  return {
    key: Math.random(),
    price: strike,
    call: {
      buy: {
        price: Number(buyOption.call).toFixed(2),
        percent: toPercent(buyOption.call / price),
        vol: toPercent(buyVol),
      },
      sell: {
        price: Number(sellOption.call).toFixed(2),
        percent: toPercent(sellOption.call / price),
        vol: toPercent(sellVol),
      },
    },
    put: {
      buy: {
        price: Number(buyOption.put).toFixed(2),
        percent: toPercent(buyOption.put / price),
        vol: toPercent(buyVol),
      },
      sell: {
        price: Number(sellOption.put).toFixed(2),
        percent: toPercent(sellOption.put / price),
        vol: toPercent(sellVol),
      },
    },
  }
}

function generateT(price, buyVol, sellVol, rate, time, step, lower, upper, b, tick, fixed) {
  let res = []
  step = Number(step)
  price = Number(price)

  let bVolRatio = (buyVol[1] - buyVol[0]) / (lower - 1);
  let sVolRatio = (sellVol[1] - sellVol[0]) / (lower - 1);
  let bv, sv;

  for (let v = price; v > lower * price; v -= step) {
    let x = v / price - 1
    bv = bVolRatio * x + buyVol[0]
    sv = sVolRatio * x + sellVol[0]
    let p = getPrice(price, v, bv, sv, rate, time, b, tick, fixed)
    res.unshift(p)
  }
  res.unshift(getPrice(price, lower * price, buyVol[1], sellVol[1], rate, time, b, tick, fixed))

  bVolRatio = (buyVol[2] - buyVol[0]) / (upper - 1)
  sVolRatio = (sellVol[2] - sellVol[0]) / (upper - 1)

  for (let v = price + step; v < upper * price; v += step) {
    let x = v / price - 1
    bv = bVolRatio * x + buyVol[0]
    sv = sVolRatio * x + sellVol[0]
    let p = getPrice(price, v, bv, sv, rate, time, b, tick, fixed)
    res.push(p)
  }
  res.push(getPrice(price, upper * price, buyVol[2], sellVol[2], rate, time, b, tick, fixed))

  return res
}

// const DEFAULT_PLACEHOLDER = '---'
//
// function getDefaultPrice(price) {
//   return {
//     key: Math.random(),
//     price: Number(price).toFixed(2),
//     call: {
//       buy: { price: DEFAULT_PLACEHOLDER, percent: DEFAULT_PLACEHOLDER, vol: DEFAULT_PLACEHOLDER },
//       sell: { price: DEFAULT_PLACEHOLDER, percent: DEFAULT_PLACEHOLDER, vol: DEFAULT_PLACEHOLDER },
//     },
//     put: {
//       buy: { price: DEFAULT_PLACEHOLDER, percent: DEFAULT_PLACEHOLDER, vol: DEFAULT_PLACEHOLDER },
//       sell: { price: DEFAULT_PLACEHOLDER, percent: DEFAULT_PLACEHOLDER, vol: DEFAULT_PLACEHOLDER },
//     },
//   }
// }
//
// function defaultT(price, step, lower, upper) {
//   let res = []
//   for (let v = lower; v < upper; v += step) {
//     res.push(getDefaultPrice(price * v))
//   }
//   return res
// }

const baseColumn =
  {
    title: '价格',
    dataIndex: 'price',
  }


const priceColumn = [
  {
    title: '卖出',
    dataIndex: 'call.buy.price',
  },
  {
    title: '买入',
    dataIndex: 'call.sell.price',
  },
  baseColumn,
  {
    title: '卖出',
    dataIndex: 'put.buy.price',
  },
  {
    title: '买入',
    dataIndex: 'put.sell.price',
  },
]

const percentColumn = [
  {
    title: '卖出%',
    dataIndex: 'call.buy.percent',
  },
  {
    title: '买入%',
    dataIndex: 'call.sell.percent',
  },
  baseColumn,
  {
    title: '卖出%',
    dataIndex: 'put.buy.percent',
  },
  {
    title: '买入%',
    dataIndex: 'put.sell.percent',
  },
]

const volColumn = [
  {
    title: '卖出vol',
    dataIndex: 'call.buy.vol',
  },
  {
    title: '买入vol',
    dataIndex: 'call.sell.vol',
  },
  baseColumn,
  {
    title: '卖出vol',
    dataIndex: 'put.buy.vol',
  },
  {
    title: '买入vol',
    dataIndex: 'put.sell.vol',
  },
]

class PriceType {
  static PRICE = 'price'
  static PERCENT = 'percent'
  static VOl = 'volatility'
}

@connect()
export default class TPriceContainer extends React.Component {
  state = {
    prePrice: NaN,
    price: NaN,
    codes: [],
    priceType: PriceType.PRICE,
    dataSource: [],
    visible: false,
    strike: null,
    code: null,
    maturity: null,
    modelSetting: null,
    model: null,
  }

  volList = {}

  onBack = () => {
    router.goBack()
  }

  onCodeChange = (code) => {
    this.setState({ code, model: this.volList[code] })
  }

  onDateChange = async (date, dateStr) => {
    this.setState({ maturity: dateStr })
  }

  constructor(props) {
    super(props)

    const { dispatch, location: { query } } = props
    const { userName, code, date, price, model } = JSON.parse(query.data)

    this.state.model = model
    this.state.maturity = date
    this.state.code = code
    this.state.price = price
    dispatch({
      type: 'order/openModelList',
      payload: {
        userName: userName,
      },
      callback: (list) => {
        list.forEach(v => {
          this.volList[v.instrumentCode] = v
        })
        const codes = list.map(c => c)
        this.setState({ codes })
      },
    })

    this.getModelSetting().then(modelSetting => this.setState({ modelSetting }))
  }

  async getModelSetting() {
    return await getOfferModelSetting(this.props.userName)
  }

  componentDidMount() {
    document.title = '场外期权报价'
  }

  render() {
    return (
      <div className={[style.tPrice, style.offerList].join(' ')}>
        <PageHeader className={style.topBar} onBack={this.onBack} title="T型报价"/>
        <InsForm
          defaultCode={this.volList[this.state.code]}
          codes={this.state.codes}
          onCodeChange={this.onCodeChange}
          onDateChange={this.onDateChange}
          expiry={this.state.maturity}
        />
        <TPrice
          code={this.state.code}
          dispatch={this.props.dispatch}
          codeInfo={this.volList[this.state.code]}
          defaultPrice={this.state.price}
          maturity={this.state.maturity}
          modelSetting={this.state.modelSetting}
          volList={this.volList}
          model={this.state.model}
        />
      </div>
    )
  }
}

function TPrice(props) {
  const [priceType, setPriceType] = useState(PriceType.PRICE)
  const [price, setPrice] = useState(null)
  const [dataSource, setDataSource] = useState([])
  const [visible, setVisible] = useState(false)
  const [strike, setStrike] = useState(null)
  const [latestPrice, setLatestPrice] = useState({})
  const [initialized, setInitialized] = useState(false)
  const [callput, setCallput] = useState('call')

  const getConfig = () => {
    return getInstrumentConfig(props.model.instrumentCode)
  }

  const onHeaderCell = (col) => {
    return {
      onClick: () => {
        let typeValues = Object.values(PriceType)
        let i = typeValues.indexOf(priceType)
        let pt = typeValues[i + 1]
        if (i === typeValues.length - 1) {
          pt = typeValues[0]
        }
        setPriceType(pt)
      },
    }
  }

  const onCellClick = (record, text, i) => {
    // if (text === DEFAULT_PLACEHOLDER) return
    setStrike(record.price)
    setVisible(true)
    setCallput(i < 2 ? 'call': 'put')
  }

  const closeModal = () => {
    setVisible(false)
  }

  function updateTPrice() {
    const { codeInfo, model } = props

    if (codeInfo == null
      || props.modelSetting == null
      || latestPrice == null
      || model == null
    ) return

    let config = getInstrumentConfig(model.instrumentCode)
    let {night_time, total_minutes} = config || {}
    let time = calcFzjfTime(props.modelSetting.n, night_time, props.modelSetting.yearTradTotal, total_minutes)

    const dataSource = generateT(
      latestPrice.last_price,
      [codeInfo.buyVolatility, codeInfo.buyVolatilityLower, codeInfo.buyVolatilityUpper],
      [codeInfo.saleVolatility, codeInfo.saleVolatilityLower, codeInfo.saleVolatilityUpper],
      codeInfo.interestRate,
      time,
      model.quotaSpacing,
      model.lowerRatio,
      model.upperRatio,
      props.modelSetting.holdingCost,
      config.tick,
      config.afterpoint
    )

    setDataSource(dataSource)

    setPrice(toFixed(latestPrice.last_price, config.afterpoint, config.tick))
    // this.setState({ price: latestPrice.last_price, prePrice: latestPrice.pre_price, dataSource })
  }

  function getColumns() {
    let cols = []
    switch (priceType) {
      case PriceType.PERCENT:
        cols = percentColumn
        break
      case PriceType.VOl:
        cols = volColumn
        break
      default:
        cols = priceColumn
        break
    }

    let config = getConfig()

    cols.forEach((c, i) => {
      if (i !== 2) {
        c.onHeaderCell = onHeaderCell
        c.render = (text, record, index) => {
          return (<div onClick={() => onCellClick(record, text, i)}>{text}</div>)
        }
        // c.render = (text, record, index) => <div>{text}</div>
      } else {
        c.render = (text, record, index) => {
          const style = record.price.toString() === price.toString() ? {backgroundColor: 'aquamarine'} : {}
          return (<div style={style}>{text}</div>)
        }
      }
    })

    return cols
  }

  function updateLatestPrice(code) {
    const { dispatch } = props

    dispatch({
      type: 'order/fetchLatest',
      payload: [code],
      callback: async (data) => {
        let latestPrice = parseSinaOptionInfo(data)[0]
        setLatestPrice(latestPrice)
      },
    })
  }

  useEffect(() => {
    updateLatestPrice(props.code)

    let timer = setInterval(() => {
      updateLatestPrice(props.code)
    }, 2000)

    return () => clearInterval(timer)
  }, [props.code])

  useEffect(() => {
    if (latestPrice == null) return
    updateTPrice()
  }, [props.model, props.maturity, latestPrice])

  useEffect(() => {
    let aborted = false
    preloadInstruments().then((cache) => {
      if (aborted) return
      setInitialized(true)
    });
    return () => {
      aborted = true
    }
  }, [props.model.shortName])


  const columns = getColumns()
  const { maturity, volList } = props

  return (
    <React.Fragment>
      <div className='title'>
        <span style={{ width: 'calc(50% - 40px)' }}>看涨</span>
        <span style={{ width: '80px', color: '#000', backgroundColor: '#f5f5f5' }}>
          {price}
          </span>
        <span style={{ width: 'calc(50% - 40px)' }}>看跌</span>
      </div>
      <i className='flex-pad'/>
      <Table
        pagination={false}
        columns={columns}
        rowClassName='t-row'
        dataSource={dataSource}
      />
      {
        visible && volList != null && initialized ?
          <LocalModal
            code={props.code}
            close={closeModal}
            maturity={maturity}
            spot={latestPrice.last_price}
            strike={strike}
            num={1}
            shortName={props.model.shortName}
            settlementPrice={latestPrice.settlement_price}
            model={props.model}
            modelSetting={props.modelSetting}
            callput={callput}
          />
          : null
      }
    </React.Fragment>
  )
}

class InsForm extends React.Component {
  state = {
    codes: [],
    shortNames: {},
  }

  defaultCode = null
  codeMap = {}

  onNameChange = (name) => {
    const codes = this.state.shortNames[name]
    this.defaultCode = codes[0]
    this.setState({ codes })
    this.emitCodeChange(codes[0].instrumentCode)
  }

  onCodeChange = (c) => {
    this.defaultCode = this.state.codes.filter(v => (v.instrumentCode === c))[0]
    this.emitCodeChange(c)
  }

  emitCodeChange(v) {
    if (this.props.onCodeChange) this.props.onCodeChange(v)
  }

  initNames() {
    if (Object.keys(this.state.shortNames).length > 0) return

    const codes = this.props.codes

    codes.forEach(c => {
      this.codeMap[c.instrumentCode] = c
      const name = this.state.shortNames[c.shortName] || []
      name.push(c)
      this.state.shortNames[c.shortName] = name
    })
  }

  initCodes() {
    if (this.state.codes.length > 0) return
    this.state.codes = this.state.shortNames[this.defaultCode.shortName]
  }

  render() {
    this.initNames()

    if (this.defaultCode == null) {
      this.defaultCode = this.props.defaultCode
      if (this.defaultCode == null) return null
    }

    this.initCodes()

    return (
      <Form layout="inline">
        <Select size='small' defaultValue={this.defaultCode.shortName} onChange={this.onNameChange}>
          {Object.keys(this.state.shortNames).map(name => (
            <Select.Option key={name} value={name}>{name}</Select.Option>
          ))}
        </Select>
        <Select size='small' value={this.defaultCode.instrumentCode} onChange={this.onCodeChange}>
          {this.state.codes.map(c => <Select.Option key={c.id}
                                                    value={c.instrumentCode}>{c.instrumentCode}</Select.Option>)}
        </Select>
        {/*<Select size='small' defaultValue="euro">*/}
        {/*<Select.Option key={1} value="euro">欧式期权</Select.Option>*/}
        {/*<Select.Option key={2} value="asia" disabled>亚式期权</Select.Option>*/}
        {/*<Select.Option key={3} value="us" disabled>美式期权</Select.Option>*/}
        {/*</Select>*/}
        <DatePicker
          size='small'
          placeholder='到期日期'
          defaultValue={moment(this.props.expiry)}
          onChange={this.props.onDateChange}
          disabled
        />
      </Form>
    )
  }
}
