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
// import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import React, { useEffect, useMemo, useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { useLocation, useNavigate, useParams } from 'react-router-dom'
// import { isEmpty, orderBy } from 'lodash'
//
// import ArtifactsTableRow from '../../../elements/ArtifactsTableRow/ArtifactsTableRow'
// import FilterMenu from '../../FilterMenu/FilterMenu'
// import Table from '../../Table/Table'

import { generatePageData } from '../../components/ModelsPage/ModelEndpoints/modelEndpoints.util'
// import { getNoDataMessage } from '../../../utils/getNoDataMessage'
import { ALERTS_FILTERS, ALERTS_PAGE, FUNCTION_FILTERS, FUNCTIONS_PAGE } from '../../constants'
import Table from '../../components/Table/Table'
import { createAlertRowData } from '../../utils/createAlertsContent'
import { useSelector } from 'react-redux'
import ArtifactsTableRow from '../../elements/ArtifactsTableRow/ArtifactsTableRow'
import Breadcrumbs from '../../common/Breadcrumbs/Breadcrumbs'
import ActionBar from '../ActionBar/ActionBar'
import ProjectsAlertsFilters from './ProjectsAlertsFilters'
import PropTypes from 'prop-types'
import Loader from '../../common/Loader/Loader'
import NoData from '../../common/NoData/NoData'
import { getNoDataMessage } from '../../utils/getNoDataMessage'

const ProjectAlertsView = ({
  alerts,
  alertsFiltersConfig,
  alertsStore,
  handleRefresh,
  filtersStore,
  refreshAlertsCallback,
  requestErrorMessage
}) => {
  const [selectedModelEndpoint] = useState({})
  const frontendSpec = useSelector(store => store.appStore.frontendSpec)

  useEffect(() => {
    // console.log(alerts)
    // console.log(setSelectedModelEndpoint)
  }, [])

  const pageData = useMemo(
    () => generatePageData(selectedModelEndpoint, frontendSpec.model_monitoring_dashboard_url),
    [frontendSpec.model_monitoring_dashboard_url, selectedModelEndpoint]
  )

  const tableContent = useMemo(() => {
    // return sortedContent.map(contentItem => createAlertRowData(contentItem, params.projectName))
    return alerts.activations.map(alert => createAlertRowData(alert))
  }, [alerts.activations])
  // console.log(alerts)
  return (
    <>
      <div className="content-wrapper">
        <div className="content__header">
          <Breadcrumbs />
        </div>
        <div className="content">
          <div className="table-container">
            <div className="content__action-bar-wrapper">
              <ActionBar
                autoRefreshIsEnabled={false}
                autoRefreshIsStopped={true}
                filterMenuName={ALERTS_FILTERS}
                filtersConfig={alertsFiltersConfig}
                handleRefresh={refreshAlertsCallback}
                page={ALERTS_PAGE}
                tab="alerts tab"
                withRefreshButton
                withoutExpandButton
                key="alerts key"
              >
                <ProjectsAlertsFilters />
              </ActionBar>
            </div>
            {alertsStore.loading ? (
              <Loader />
            ) : tableContent.length === 0 ? (
              <NoData
                message={getNoDataMessage(
                  filtersStore,
                  alertsFiltersConfig,
                  requestErrorMessage,
                  FUNCTIONS_PAGE,
                  null,
                  FUNCTION_FILTERS
                )}
              />
            ) : (
              <Table
                actionsMenu={[]}
                pageData={pageData}
                retryRequest={handleRefresh}
                selectedItem={selectedModelEndpoint}
                tableClassName="model-endpoints-table"
                tableHeaders={tableContent[0]?.content ?? []}
              >
                {tableContent.map((tableItem, index) => (
                  // isRowRendered(virtualizationConfig, index) && (
                  <ArtifactsTableRow
                    key={index}
                    hideActionsMenu
                    rowIndex={index}
                    rowItem={tableItem}
                    actionsMenu={[]}
                    selectedItem={selectedModelEndpoint}
                  />
                ))}
              </Table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

ProjectAlertsView.propTypes = {
  alertsStore: PropTypes.object.isRequired,
  refreshAlertsCallback: PropTypes.func.isRequired
}
export default ProjectAlertsView
