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
import { createForm } from 'final-form'
import { Form } from 'react-final-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'

import { RoundedIcon, Button } from 'igz-controls/components'
import FilterMenuModal from '../FilterMenuModal/FilterMenuModal'
import ArtifactsFilters from '../ArtifactsActionBar/ArtifactsFilters'
import NameFilter from '../../common/NameFilter/NameFilter'

import { GROUP_BY_NONE } from '../../constants'
import { removeFilters } from '../../reducers/filtersReducer'
import { applyFeatureChanges } from '../../utils/filterActionBar.util'
import useCustomHook from '../../hooks/filterActionBar.hook'

import { ReactComponent as RefreshIcon } from 'igz-controls/images/refresh.svg'
import { ReactComponent as CollapseIcon } from 'igz-controls/images/collapse.svg'
import { ReactComponent as ExpandIcon } from 'igz-controls/images/expand.svg'

function FeatureActionBar({
  actionButtons,
  cancelRequest,
  expand,
  features,
  filterMenuName,
  handleExpandAll,
  handleRefresh,
  page,
  tab,
  setContent,
  setSelectedRowData,
  withoutExpandButton
}) {
  const filtersStore = useSelector(store => store.filtersStore)
  const filterMenuModal = useSelector(store => store.filtersStore.filterMenuModal[filterMenuName])
  const changes = useSelector(store => store.detailsStore.changes)
  const dispatch = useDispatch()
  const params = useParams()
  const navigate = useNavigate()
  const formRef = React.useRef(
    createForm({
      initialValues: { name: '' },
      onSubmit: () => {}
    })
  )
  const { filtersInitialState, refresh } = useCustomHook(
    page,
    dispatch,
    filterMenuModal,
    filterMenuName,
    changes,
    cancelRequest,
    filtersStore,
    handleRefresh,
    removeFilters
  )

  return (
    <Form form={formRef.current} onSubmit={() => {}}>
      {formState => (
        <div className="action-bar">
          <div className="action-bar__filters">
            <NameFilter
              applyChanges={value =>
                applyFeatureChanges(
                  value,
                  filterMenuModal.values,
                  changes,
                  dispatch,
                  setSelectedRowData,
                  handleRefresh,
                  params,
                  navigate,
                  page,
                  tab,
                  filtersStore,
                  setContent
                )
              }
            />
            <FilterMenuModal
              applyChanges={filterMenuModal =>
                applyFeatureChanges(
                  formState.values.name,
                  filterMenuModal,
                  changes,
                  dispatch,
                  setSelectedRowData,
                  handleRefresh,
                  params,
                  navigate,
                  page,
                  tab,
                  filtersStore,
                  setContent
                )
              }
              filterMenuName={filterMenuName}
              initialValues={filtersInitialState}
              restartFormTrigger={page}
              values={filterMenuModal.values}
              wizardClassName="artifacts-filters__wrapper"
            >
              <ArtifactsFilters
                iteration={false}
                artifacts={features}
                filterMenuName={filterMenuName}
                page={page}
              />
            </FilterMenuModal>
          </div>
          <div className="action-bar__actions">
            {actionButtons.map((actionButton, index) =>
              actionButton &&
              !actionButton.hidden &&
              actionButton.popupButton &&
              actionButton.onClick ? (
                actionButton.onClick(actionButton)
              ) : (
                <Button
                  key={index}
                  variant={actionButton.variant}
                  label={actionButton.label}
                  tooltip={actionButton.tooltip}
                  onClick={actionButton.onClick}
                  className={actionButton.className}
                />
              )
            )}

            <RoundedIcon tooltipText="Refresh" onClick={() => refresh(formState)} id="refresh">
              <RefreshIcon />
            </RoundedIcon>
            {!withoutExpandButton && filtersStore.groupBy !== GROUP_BY_NONE && (
              <RoundedIcon
                id="toggle-collapse"
                tooltipText={expand ? 'Collapse' : 'Expand all'}
                onClick={() => handleExpandAll()}
              >
                {expand ? <CollapseIcon /> : <ExpandIcon />}
              </RoundedIcon>
            )}
          </div>
        </div>
      )}
    </Form>
  )
}

FeatureActionBar.defaultProps = {
  actionButtons: [],
  cancelRequest: null,
  withoutExpandButton: true
}

FeatureActionBar.propTypes = {
  actionButtons: PropTypes.arrayOf(
    PropTypes.shape({
      className: PropTypes.string,
      hidden: PropTypes.bool,
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.string.isRequired
    })
  ),
  cancelRequest: PropTypes.func,
  expand: PropTypes.bool,
  features: PropTypes.arrayOf(PropTypes.object).isRequired,
  filterMenuName: PropTypes.string.isRequired,
  handleExpandAll: PropTypes.func,
  handleRefresh: PropTypes.func.isRequired,
  page: PropTypes.string.isRequired,
  setContent: PropTypes.func.isRequired,
  setSelectedRowData: PropTypes.func.isRequired,
  tab: PropTypes.string,
  withoutExpandButton: PropTypes.bool
}

export default FeatureActionBar
