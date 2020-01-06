import React,{PureComponent} from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { parseSinaOptionInfo } from '../../utils/utils';
import { Tabs, Table,Form,DatePicker, Modal } from 'antd';
import moment from 'moment';
import style from './style.less'
import Icon from 'antd/es/icon'
// import LocalModal from './LocalModal'
import { calcPriceModel } from './price'
import { getOfferModelSetting, toFixed } from './utils'

const announcement = '声明：以上价格为平值看涨（看跌）期权参考报价，名义本金在500万以内有效，更多报价欢迎来电咨询：021-20778915。'

function getRecordStyle(record) {
  return {
    width:'100%', height: '100%',
    backgroundColor: record.backgroundColor,
    color: record.latestPrice > record.proPrice ? '#ef5350':'#26a69a'
  }
}

const T_PRICE_URL = '/price/t'

const baseColumn = [
  {
    title: '品种',
    dataIndex: 'shortName',
    key: 'shortName',
    render: val => <span>{val}</span>
  },
  {
    title: '标的',
    dataIndex: 'instrumentCode',
    key: 'instrumentCode',
  },
  {
    title: '最新价',
    key: 'latestPrice',
  }
]

const priceColumn = [
  {
    title: '卖出',
    key: 'buyPrice',
    align: 'center',
    render: record => <div style={getRecordStyle(record)}>{record.buyPrice}</div>,
  },
  {
    title: '买入',
    key: 'sellPrice',
    align: 'center',
    render: record => <div style={getRecordStyle(record)}>{record.sellPrice}</div>,
  }
]

const percentColumn = [
  {
    title: '卖出%',
    key: 'buyPercent',
    align: 'center',
  },
  {
    title: '买入%',
    key: 'sellPercent',
    align: 'center',
  }
]

const volColumn = [
  {
    title: '卖出vol',
    key: 'buyVol',
    align: 'center',
  },
  {
    title: '买入vol',
    key: 'sellVol',
    align: 'center',
  }
]

class PriceType {
  static PRICE = 'price';
  static PERCENT = 'percent';
  static VOl = 'volatility';
}

@connect(({ user,order,loading }) => ({
  user,
  order,
  loading: loading.models.order,
}))
@Form.create()
export default class PriceList extends PureComponent {
  state = {
    userInfo: null,
    modelList: [],
    selfList: [],
    userName: '',
    date: null,
    modelPrice: {},
    priceLoading: true,
    priceType: PriceType.PRICE,
    visible: false,
    modalContent: null,
    enabledDays: [],
    footer: null
  };

  prices = {}

  getUserName() {
    return this.props.match.params.userName
  }

  componentDidMount(){
    document.title = '场外期权报价'

    const userName = this.getUserName();

    getOfferModelSetting(userName).then((modelSetting) => {
      let enabledDays = this.state.enabledDays
      enabledDays.push(modelSetting.offerDate)
      this.setState({enabledDays, date: moment(modelSetting.offerDate), footer: modelSetting.footer})
      this.maturityDate = modelSetting.offerDate
    })

    const { dispatch } = this.props;

    dispatch({
      type: 'user/findRate',
      payload: {
        userName: userName,
      },
      callback: (userInfo) => {
        this.setState({
          userInfo,
        })
        dispatch({
          type: 'order/openModelList',
          payload: {
            userName: userName,
          },
          callback: (list) => {
            this.setState({
              selfList: list,
            });
            this.fetchLatestPrice();
          },
        });
      }
    })

    this.setState({ userName });
    this.timer = setInterval(this.fetchLatestPrice, 2000);
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  fetchLatestPrice = () =>{
    const endDate = this.state.date;
    const {selfList,modelPrice} = this.state;
    const list = selfList;
    const codeArray = list&&list.length>0&&list.map((item)=>{return item.instrumentCode});
    const {dispatch} = this.props;
    if(codeArray && codeArray.length>0){
      dispatch({
        type: 'order/fetchLatest',
        payload: codeArray,
        callback: async (data) => {
          const {tmp, modelPrice1} = await calcPriceModel(list, modelPrice, endDate, data, this.getUserName())

          this.setState({
            selfList: tmp,
            modelPrice: modelPrice1,
            priceLoading: false
          })

          const prices = parseSinaOptionInfo(data)
          prices.forEach(p => {
            this.prices[p.code] = p.last_price
          })
        }
      });
    }
  };

  dateChange = (date,dateString)=>{
    this.maturityDate = dateString
    this.setState({
      date,
      priceLoading: true
    });

    this.fetchLatestPrice();
  };

  disabledDate = (current) => {
    for (let d of this.state.enabledDays) {
      if (current.isSame(d, 'day')) return false
    }
    return true;
  }

  onHeaderCell = (col) => {
    return {
      onClick: () => {
        let typeValues = Object.values(PriceType)
        let i = typeValues.indexOf(this.state.priceType);
        let priceType = typeValues[i + 1];
        if (i === typeValues.length - 1) {
          priceType = typeValues[0];
        }
        // const priceType = this.state.priceType === PriceType.PRICE ? PriceType.PERCENT : PriceType.PRICE
        this.setState({priceType})
      }
    }
  }

  closeModal = () => {
    this.setState({visible: false})
  }

  onHelp = () => {
    Modal.info({
      title: '操作提示',
      okText: '我知道了',
      className: style.modalInfo,
      maskClosable: true,
      content: (
        <React.Fragment>
          <p>点击代码和价格一栏进入T型报价</p>
          <p>点击买价和卖价一栏进入详细价格界面</p>
          <p>pc端建议打开F12进入手机浏览模式</p>
        </React.Fragment>
      )
    })
  }

  onModal(record) {
    if (Boolean(Number(record.buyPrice))) {
      this.setState({visible: true, modalContent: record})
    }
  }

  getColumns() {
    let cols = [];
    switch (this.state.priceType) {
      case PriceType.VOl:
        cols = volColumn;
        break;
      case PriceType.PERCENT:
        cols = percentColumn;
        break;
      default:
        cols = priceColumn;
        break;
    }

    cols.forEach(c => {
      c.onHeaderCell = this.onHeaderCell
      // c.render = (record) => {
      //   return <div onClick={this.onModal.bind(this, record)} style={getRecordStyle(record)}>{record[c.key]}</div>
      // }
      c.render = record => (
        <TpriceLink maturity={this.maturityDate} userName={userName} record={record}>
          <div style={getRecordStyle(record)}>{record[c.key]}</div>
        </TpriceLink>
      )
    })

    const userName = this.props.match.params.userName

    baseColumn[1].render = (val, record) => (
      <TpriceLink maturity={this.maturityDate} userName={userName} record={record}>{val}</TpriceLink>
    )
    baseColumn[2].render = record => (
      <TpriceLink maturity={this.maturityDate} userName={userName} record={record}>
        <div
          style={getRecordStyle(record)}>
          {record.latestPrice}
        </div>
      </TpriceLink>
    )

    return baseColumn.concat(cols)
  }

  render(){
    let {selfList, footer} = this.state;
    if (this.state.date == null) return null

    const columns = this.getColumns();

    return (
      <div className={style.offerList}>
        <div className={style.topBar}>
          <DatePicker
            defaultValue={this.state.date}
            disabledDate={this.disabledDate}
            placeholder="到期日期"
            onChange={this.dateChange}
            autoFocus={false}
            dropdownClassName={style.dateDropdown}
            disabled
          />
          <i className='flex-pad'/>
          <Icon type="question-circle" onClick={this.onHelp}/>
        </div>
        <Table
          rowKey={record => record.id}
          pagination={false}
          dataSource={selfList}
          columns={columns}
          className={style.table}
        />
        {/*<LocalModal*/}
          {/*visible={this.state.visible}*/}
          {/*close={this.closeModal}*/}
          {/*maturity={this.maturityDate}*/}
          {/*tranNumber={100}*/}
          {/*dispatch={this.props.dispatch}*/}
          {/*{...this.state.modalContent}*/}
        {/*/>*/}
        <div className={style.bottom}>
          {footer || announcement}
        </div>
      </div>
    )
  }
}

function TpriceLink(props) {
  let {record, maturity, userName} = props;

  return (
    <Link
      to={
        `${T_PRICE_URL}?data=${JSON.stringify({
          code: record.instrumentCode, date: maturity, userName, price: record.latestPrice, model: record
        })}`
      }
    >
      {props.children}
    </Link>
  )
}
