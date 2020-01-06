import React,{PureComponent} from 'react';
import { connect } from 'dva';
import { parseSinaOptionInfo } from '../../utils/utils';
import { Tabs, Table,Card,Form,Row,Col,DatePicker,Radio,Button } from 'antd';
import moment from 'moment';
import {getWorkDate} from '../../utils/price';
import style from './style.less'
import globalStyle from '@/global.less';
import { calcPriceModel } from './price'


const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
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
    tab: '1',
    modelPrice: {},
    endDate: null,
    priceLoading: true
  };

  componentDidMount(){
    this.setState({
      tab: this.props.match.params.userName? '2' : '1',
    });


    const {dispatch} = this.props;
    dispatch({
      type: 'user/findOfferModelSetting',
      callback: (resp)=>{
        if (resp.code === 2000) {
          this.props.form.setFieldsValue({ endTime: moment(new Date(resp.data.offerDate)) });
          this.setState({
            endDate: moment(new Date(resp.data.offerDate))
          });
        } else {
          this.props.form.setFieldsValue({ endTime: this.nextMonth() });
          this.setState({
            endDate: this.nextMonth()
          });
        }
      }
    });
    dispatch({
      type:'user/findUserInfo',
      callback:(userInfo)=>{
        const modelId = userInfo.modelId;
        const modelOtherId = userInfo.modelOtherId;
        const userName= userInfo.userName;
        this.setState({
          userInfo,
        });
        if(modelOtherId !== undefined && modelOtherId !== null && modelOtherId.trim() !== ""){
          dispatch({
            type: 'order/modelList',
            payload: {
              userName: modelOtherId,
            },
            callback:(list)=>{
              this.setState({
                modelList: list,
              });
              if (list.length === 0) {
                this.setState({
                  priceLoading: false,
                })
              }
              this.fetchLatestPrice();
            }
          })
        } else {
          dispatch({
            type: 'order/modelList',
            payload: {
              userName: modelId,
            },
            callback:(list)=>{
              this.setState({
                modelList: list,
              });
              if (list.length === 0) {
                this.setState({
                  priceLoading: false,
                })
              }
              this.fetchLatestPrice();
            }
          })
        }
        dispatch({
          type: 'order/modelList',
          payload: {
            userName: userName,
          },
          callback:(list)=>{
            this.setState({
              selfList: list,
              priceLoading: false,
            })
          }
        })
      }
    });

    this.timer = setInterval(this.fetchLatestPrice,2000);
  }

  nextMonth=()=>{
    let next = moment(new Date()).add(1,"months");
    const weekend = new Date(next.format("YYYY-MM-DD")).getDay()
    if(weekend === 6){
      next = next.add(2,"days");
    }else if(weekend === 0){
      next = next.add(1,"days");
    }
    return next;
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  tabChange =(activeKey)=>{
    this.setState({
      tab: activeKey,
      date: this.nextMonth(),
      priceLoading: true
    })
    this.props.form.setFieldsValue({ endTime: this.nextMonth() });
  };

  fetchLatestPrice = () =>{
    const {modelList,userInfo,tab,selfList, modelPrice, endDate} = this.state;
    const list = tab === '1'?modelList:selfList;
    const codeArray = list&&list.length>0&&list.map((item)=>{return item.instrumentCode});
    const {dispatch} = this.props;
    if(codeArray && codeArray.length>0){
      dispatch({
        type: 'order/fetchLatest',
        payload: codeArray,
        callback: async (data) => {
          const {tmp, modelPrice1} = await calcPriceModel(list, modelPrice, endDate, data, userInfo.userName)

          if(tab === "1"){
            this.setState({
              modelList: tmp,
              modelPrice: modelPrice1,
              priceLoading: false
            })
          } else {
            this.setState({
              selfList: tmp,
              modelPrice: modelPrice1,
              priceLoading: false
            })
          }
        }
      });
    }
  };


  dateChange=(date,dateString)=>{
    this.setState({
      endDate: date,
      priceLoading: true
    });
  };


  render(){
    const paramUserName = this.props.match.params.userName || undefined
    const {modelList,userInfo,selfList,priceLoading} = this.state;
    const columns = [
      {
        title: '品种',
        dataIndex: 'shortName',
        key: 'shortName',
        align: 'center',
        sorter: (a, b) => a.shortName.toString().localeCompare(b.shortName.toString()),
        render: val =><b>{val}</b>
      },
      {
        title: '标的',
        dataIndex: 'instrumentCode',
        key: 'instrumentCode',
        align: 'center',
        render: val =><b>{val}</b>
      },
      {
        title: '最新价',
        key: 'latestPrice',
        align: 'center',
        render: record=> <div style={{width:'100%', height: '100%', backgroundColor: record.backgroundColor, color: record.latestPrice > record.proPrice ? 'red':'green'}}>{record.latestPrice}</div>,
      },
      {
        title: '权利金',
        align: 'center',
        children: [
          {
            title: '客户卖出',
            key: 'buyPrice',
            align: 'center',
            render: record=> <div style={{width:'100%', height: '100%', backgroundColor: record.backgroundColor, color: record.latestPrice > record.proPrice ? 'red':'green'}}>{record.buyPrice}</div>,
          },
          {
            title: '客户买入',
            key: 'sellPrice',
            align: 'center',
            render: record=> <div style={{width:'100%', height: '100%', backgroundColor: record.backgroundColor, color: record.latestPrice > record.proPrice ? 'red':'green'}}>{record.sellPrice}</div>,
          },
        ]
      },
      {
        title: '百分比',
        align: 'center',
        children: [
          {
            title: '客户卖出',
            key: 'buyPercent',
            align: 'center',
            render: record=> <div style={{width:'100%', height: '100%', backgroundColor: record.backgroundColor, color: record.latestPrice > record.proPrice ? 'red':'green'}}>{record.buyPercent}</div>,
          },
          {
            title: '客户买入',
            key: 'sellPercent',
            align: 'center',
            render: record=> <div style={{width:'100%', height: '100%', backgroundColor: record.backgroundColor, color: record.latestPrice > record.proPrice ? 'red':'green'}}>{record.sellPercent}</div>,
          },
        ]
      },
      // {
      //   title: '波动率',
      //   align: 'center',
      //   children: [
      //     {
      //       title: '客户卖出',
      //       key: 'buyVol',
      //       align: 'center',
      //       render: record=> <div style={{width:'100%', height: '100%', backgroundColor: record.backgroundColor, color: record.latestPrice > record.proPrice ? 'red':'green'}}>{record.buyVol}</div>,
      //     },
      //     {
      //       title: '客户买入',
      //       key: 'sellVol',
      //       align: 'center',
      //       render: record=> <div style={{width:'100%', height: '100%', backgroundColor: record.backgroundColor, color: record.latestPrice > record.proPrice ? 'red':'green'}}>{record.sellVol}</div>,
      //     },
      //   ]
      // },
      // {
      //   title: '买价',
      //   dataIndex: 'buyPrice',
      //   key: 'buyPrice',
      // },
      // {
      //   title: '卖价',
      //   dataIndex: 'sellPrice',
      //   key: 'sellPrice',
      // },
    ];
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
    };
    return (
      <div>
        <Tabs onChange={this.tabChange} className={globalStyle.tab}>
          {
            !paramUserName &&
            <TabPane tab={'模型报价'} key="1">
              <Card>
                <Form onSubmit={this.handleSubmit}>
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem label="到期日" {...formItemLayout}>
                        {
                          getFieldDecorator('endTime')(
                            <DatePicker placeholder="请选择" onChange={this.dateChange} />
                          )
                        }
                      </FormItem>
                    </Col>
                    {/*<Col span={4}>*/}
                    {/*<Button type="primary" htmlType="submit">*/}
                    {/*查询*/}
                    {/*</Button>*/}
                    {/*</Col>*/}
                  </Row>
                </Form>
                <Table
                  rowKey={record=>record.id}
                  pagination={false}
                  loading={priceLoading}
                  bordered
                  dataSource={modelList}
                  columns={columns}
                />
              </Card>
            </TabPane>
          }
          {
            userInfo&&userInfo.quoteFlag===true&&userInfo.userType===0&&
            <TabPane tab={'我的报价'} key="2">
              <Card>
                <Form onSubmit={this.handleSubmit}>
                  <Row gutter={24}>
                    <Col span={8}>
                      <FormItem label="到期日" {...formItemLayout}>
                        {
                          getFieldDecorator('endTime')(
                            <DatePicker placeholder="请选择" onChange={this.dateChange} />
                          )
                        }
                      </FormItem>
                    </Col>
                    {/*<Col span={4}>*/}
                    {/*<Button type="primary" htmlType="submit">*/}
                    {/*查询*/}
                    {/*</Button>*/}
                    {/*</Col>*/}
                  </Row>
                </Form>
                <Table
                  rowKey={record=>record.id}
                  pagination={false}
                  loading={priceLoading}
                  bordered
                  dataSource={selfList}
                  columns={columns}
                />
              </Card>
            </TabPane>
          }
        </Tabs>
      </div>
    )
  }
}
