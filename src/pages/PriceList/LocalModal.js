import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { calcMargin } from './price'
import { Modal, Radio } from 'antd'
import style from './style.less'
import { Form } from 'antd'
import InputNumber from 'antd/es/input-number'
import Divider from 'antd/es/divider'
import { calcFzjfTime, getInstrumentConfig, preloadInstruments, calcVol } from './utils'
import { calcOptionPrice } from '../../utils/price'

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
}

export default function LocalModal(props) {
  const [callPut, setCallPut] = useState(props.callput || 'call')
  const [spot, setSpot] = useState(props.spot)
  const [strike, setStrike] = useState(props.strike)
  const [number, setNumber] = useState(props.num)
  const [margin, setMargin] = useState(0)
  const [price, setPrice] = useState({})

  const config = getInstrumentConfig(props.code)

  const onRadioChange = e => {
    setCallPut(e.target.value)
  }

  const updatePrice = (spot, strike, callPut) => {
    let { night_time, total_minutes } = config || {}
    let time = calcFzjfTime(props.modelSetting.n, night_time, props.modelSetting.yearTradTotal, total_minutes)
    const b = props.model.holdingCost
    const r = props.model.interestRate
    const vol = calcVol(spot, strike, props.model)
    const bv = vol.buy
    const sv = vol.sell

    let p = {
      sell: calcOptionPrice(spot, strike, sv, r, time, b)[callPut],
      buy: calcOptionPrice(spot, strike, bv, r, time, b)[callPut]
    }

    setPrice(Object.assign(p, {
      buyVol: bv,
      buyPercent: p.buy / spot,
      sellVol: sv,
      sellPercent: p.sell / spot
    }))

    const { rolledMargin } = calcMargin(
      null,
      props.settlementPrice,
      config.d1,
      config.d2,
      props.model.buyVolatility,
      number,
      strike,
      time,
      props.modelSetting.interestRate,
      callPut,
      b
    )

    setMargin(rolledMargin)
  }

  useEffect(() => {
    updatePrice(spot, strike, callPut)
  }, [spot, strike, callPut, number, config])

  return (
    <Modal
      className={style.transModal}
      title={`${props.code}(${moment(props.maturity).format('YYYY-MM-DD')})`}
      visible={true}
      footer={null}
      onOk={props.close}
      onCancel={props.close}
    >
      <Form layout="horizontal">
        <Form.Item className="collection-create-form_last-form-item" label='期权类型' {...formItemLayout}>
          <Radio.Group value={callPut} onChange={onRadioChange}>
            <Radio value="call">看涨</Radio>
            <Radio value="put">看跌</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="标的价格" {...formItemLayout}>
          <InputNumber type='number' value={spot} onChange={setSpot} />
        </Form.Item>
        <Form.Item label="执行价" {...formItemLayout}>
          <InputNumber type="number" value={strike} onChange={setStrike} />
        </Form.Item>
        <Form.Item label="成交数量" {...formItemLayout}>
          <InputNumber type="number" value={number} onChange={setNumber} />
          <span style={{margin: "0 5px"}}>{config.unit}</span>
        </Form.Item>
        <Divider />
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TransData
            title='客户卖出'
            price={price.buy}
            percent={price.buyPercent}
            vol={price.buyVol}
            totalText='保证金'
            total={Math.round(Number(margin) * 100) * number / 100}
            bgColor='#5bb85d'
          />
          <TransData
            title='客户买入'
            price={price.sell}
            percent={price.sellPercent}
            vol={price.sellVol}
            totalText='权利金'
            total={Math.round(Number(price.sell) * 100) * number / 100}
            bgColor='#d9544f'
          />
        </div>
      </Form>
    </Modal>
  )

}

function TransData(props) {
  return (
    <div style={{ width: 'calc(50% - 5px)' }}>
      <div className={style.transData} style={{ color: props.bgColor }}>
        <p>估计值: {Number(props.price).toFixed(2)} | {Number(props.percent * 100).toFixed(2)}%</p>
        <p>{props.title}</p>
        <p>vol: {Number(props.vol * 100).toFixed(2)}%</p>
      </div>
      <div className={style.transInfo}>
        {props.totalText}: {Number(props.total).toFixed(2)}
      </div>
    </div>
  )
}
