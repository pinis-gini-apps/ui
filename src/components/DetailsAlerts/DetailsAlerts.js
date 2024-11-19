/*
Copyright 2019 Iguazio Systems Ltd.

Licensed under the Apache License, Version 2.0 (the "License") with
an addition restriction as set forth herein. You may not use this
file except in compliance with the License. You may obtain a copy of
the License at http://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied. See the License for the specific language governing
permissions and limitations under the License.

In addition, you may not use the software for any purposes that are
illegal under applicable law, and the grant of the foregoing license
under the Apache 2.0 license is conditioned upon your compliance with
such restriction.
*/

import DatePicker from '../../common/DatePicker/DatePicker'
import { TIME_FRAME_LIMITS } from '../../utils/datePicker.util'
import React from 'react'
import { useSelector } from 'react-redux'
// import { filters } from '../ModelsPage/RealTimePipelines/realTimePipelines.util'
// import { MODELS_PAGE, REAL_TIME_PIPELINES_TAB } from '../../constants'
// import FilterMenu from '../FilterMenu/FilterMenu'

const DetailsAlerts = () => {
  const detailsStore = useSelector(store => store.detailsStore)

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <DatePicker
          className="details-date-picker"
          date={detailsStore.dates.value[0]}
          dateTo={detailsStore.dates.value[1]}
          selectedOptionId="past24hours"
          label=""
          onChange={() => console.log('date picker')}
          type="date-range-time"
          timeFrameLimit={TIME_FRAME_LIMITS.MONTH}
          withLabels
        />
      </div>
    </div>
  )
}

export default DetailsAlerts
