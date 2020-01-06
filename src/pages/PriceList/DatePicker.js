import React from 'react'
import style from './style.less'
import DatePicker from 'antd/es/date-picker'
import moment from 'moment'

export default class _ extends React.Component {
  disabledDate = (current) => {
    return current.isBefore(moment().add(15, 'd')) || current.weekday() > 4
  }

  render() {
    return (
      <DatePicker
        disabledDate={this.disabledDate}
        autoFocus={false}
        dropdownClassName={style.dateDropdown}
        {...this.props}
      />
    )
  }
}
