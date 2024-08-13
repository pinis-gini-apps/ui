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
import classnames from 'classnames'

import { ReactComponent as UnCheckBox } from 'igz-controls/images/checkbox-unchecked.svg'
import { ReactComponent as Checkbox } from 'igz-controls/images/checkbox-checked.svg'

import './checkBox.scss'

const CheckBox = ({
  children,
  className = '',
  disabled = false,
  item,
  onChange,
  selectedId = ''
}) => {
  const checkboxClassName = classnames('checkbox', className, disabled && 'checkbox_disabled')

  return (
    <span className={checkboxClassName} onClick={() => !disabled && onChange(item.id)}>
      {item.id === selectedId ? (
        <Checkbox className="checked" />
      ) : (
        <UnCheckBox className="unchecked" />
      )}
      {children || item.label}
    </span>
  )
}

CheckBox.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  selectedId: PropTypes.string
}

export default React.memo(CheckBox)
