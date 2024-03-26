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
import { OnChange } from 'react-final-form-listeners'
import { useForm } from 'react-final-form'
import PropTypes from 'prop-types'

import { FormInput } from 'igz-controls/components'
import FormTagFilter from '../../common/FormTagFilter/FormTagFilter'

import { LABELS_FILTER, TAG_FILTER } from '../../constants'

import './featureFilters.scss'

const FeatureFilters = ({ features, iteration }) => {
  const form = useForm()

  const handleLabelsChange = value => {
    form.change(LABELS_FILTER, value || '')
  }

  return (
    <div className="feature-filters">
      <div className="form-row">
        <FormInput label="Labels" name={LABELS_FILTER} placeholder="key1,key2=value,..." />
        <OnChange name={LABELS_FILTER}>{handleLabelsChange}</OnChange>
      </div>
      <div className="form-row">
        <FormTagFilter content={features} label="Version tag" name={TAG_FILTER} />
      </div>
    </div>
  )
}

FeatureFilters.propTypes = {
  features: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default FeatureFilters
