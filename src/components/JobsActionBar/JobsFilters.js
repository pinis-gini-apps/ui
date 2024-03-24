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
import React from 'react'
import PropTypes from 'prop-types'
import { OnChange } from 'react-final-form-listeners'
import { useForm } from 'react-final-form'

import { FormInput, FormSelect } from 'igz-controls/components'

import { generateStatusFilter } from '../../components/FilterMenu/filterMenu.settings'

import { LABELS_FILTER } from '../../constants'

import '../ArtifactsActionBar/artifactsFilters.scss'

const JobsFilters = ({ labels, options, useFailedStatus }) => {
  const { change } = useForm()

  const handleLabelsChange = value => {
    change(LABELS_FILTER, value || '')
  }

  return (
    <div className="artifacts-filters">
      {labels && (
        <div className="form-row">
          <FormInput label="Labels" name={LABELS_FILTER} placeholder="key1,key2=value,..." />
          <OnChange name={LABELS_FILTER}>{handleLabelsChange}</OnChange>
        </div>
      )}
      {options && (
        <div className="form-row">
          <FormSelect
            label="Status"
            options={generateStatusFilter(useFailedStatus)}
            name={'status'}
          />
        </div>
      )}
    </div>
  )
}

JobsFilters.defaultProps = {
  labels: false,
  options: false
}

JobsFilters.propTypes = {
  labels: PropTypes.bool,
  options: PropTypes.bool,
  useFailedStatus: PropTypes.bool
}

export default JobsFilters
