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
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'

import ActionBar from '../../ActionBar/ActionBar'
import FeatureFilters from '../FeatureFilters'
import FeatureSetsPanel from '../../FeatureSetsPanel/FeatureSetsPanel'
import FeatureStoreTabs from '../FeatureStoreTabs/FeaturePageTabs'
import FeatureStoreTableRow from '../../../elements/FeatureStoreTableRow/FeatureStoreTableRow'
import NoData from '../../../common/NoData/NoData'
import Table from '../../Table/Table'

import { FEATURE_FILTERS, FEATURE_SETS_TAB, FEATURE_STORE_PAGE } from '../../../constants'
import { PRIMARY_BUTTON } from 'igz-controls/constants'
import { VIRTUALIZATION_CONFIG } from '../../../types'
import { featureSetsFilters } from './featureSets.util'
import { createFeatureSetTitle } from '../featureStore.util'
import { getNoDataMessage } from '../../../utils/getNoDataMessage'
import { isRowRendered } from '../../../hooks/useVirtualization.hook'

const FeatureSetsView = React.forwardRef(
  (
    {
      actionsMenu,
      applyDetailsChanges,
      applyDetailsChangesCallback,
      closePanel,
      createFeatureSetSuccess,
      detailsFormInitialValues,
      featureSets,
      featureSetsPanelIsOpen,
      featureStore,
      filtersStore,
      handleActionsMenuClick,
      handleExpandRow,
      handleRefresh,
      largeRequestErrorMessage,
      pageData,
      selectedFeatureSet,
      selectedRowData,
      setFeatureSets,
      setSelectedFeatureSet,
      setSelectedRowData,
      tableContent,
      virtualizationConfig,
      urlTagOption
    },
    { featureStoreRef, tableRef, tableBodyRef }
  ) => {
    const params = useParams()

    return (
      <div className="feature-store" ref={featureStoreRef}>
        <div className="content__action-bar-wrapper">
          <FeatureStoreTabs />
          <ActionBar
            actionButtons={[
              {
                className: 'action-button',
                hidden: false,
                onClick: handleActionsMenuClick,
                label: createFeatureSetTitle,
                variant: PRIMARY_BUTTON
              }
            ]}
            filters={featureSetsFilters}
            filterMenuName={FEATURE_FILTERS}
            handleRefresh={handleRefresh}
            page={FEATURE_STORE_PAGE}
            tab={FEATURE_SETS_TAB}
          >
            <FeatureFilters features={featureSets} />
          </ActionBar>
        </div>
        {featureStore.loading ? null : featureSets.length === 0 ? (
          <NoData
            message={getNoDataMessage(
              filtersStore,
              featureSetsFilters,
              largeRequestErrorMessage,
              FEATURE_STORE_PAGE,
              FEATURE_SETS_TAB,
              FEATURE_FILTERS
            )}
          />
        ) : (
          <>
            <Table
              actionsMenu={actionsMenu}
              applyDetailsChanges={applyDetailsChanges}
              applyDetailsChangesCallback={applyDetailsChangesCallback}
              detailsFormInitialValues={detailsFormInitialValues}
              handleCancel={() => setSelectedFeatureSet({})}
              pageData={pageData}
              ref={{ tableRef, tableBodyRef }}
              retryRequest={handleRefresh}
              selectedItem={selectedFeatureSet}
              tab={FEATURE_SETS_TAB}
              tableClassName="feature-sets-table"
              tableHeaders={tableContent[0]?.content ?? []}
              virtualizationConfig={virtualizationConfig}
            >
              {tableContent.map(
                (tableItem, index) =>
                  isRowRendered(virtualizationConfig, index) && (
                    <FeatureStoreTableRow
                      actionsMenu={actionsMenu}
                      handleExpandRow={handleExpandRow}
                      rowIndex={index}
                      key={index}
                      pageTab={FEATURE_SETS_TAB}
                      rowItem={tableItem}
                      selectedItem={selectedFeatureSet}
                      selectedRowData={selectedRowData}
                    />
                  )
              )}
            </Table>
          </>
        )}
        {featureSetsPanelIsOpen && (
          <FeatureSetsPanel
            closePanel={closePanel}
            createFeatureSetSuccess={createFeatureSetSuccess}
            project={params.projectName}
          />
        )}
      </div>
    )
  }
)

FeatureSetsView.propTypes = {
  actionsMenu: PropTypes.array.isRequired,
  applyDetailsChanges: PropTypes.func.isRequired,
  applyDetailsChangesCallback: PropTypes.func.isRequired,
  closePanel: PropTypes.func.isRequired,
  createFeatureSetSuccess: PropTypes.func.isRequired,
  detailsFormInitialValues: PropTypes.object.isRequired,
  featureSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  featureSetsPanelIsOpen: PropTypes.bool.isRequired,
  featureStore: PropTypes.object.isRequired,
  filtersStore: PropTypes.object.isRequired,
  handleActionsMenuClick: PropTypes.func.isRequired,
  handleExpandRow: PropTypes.func.isRequired,
  handleRefresh: PropTypes.func.isRequired,
  largeRequestErrorMessage: PropTypes.string.isRequired,
  pageData: PropTypes.object.isRequired,
  selectedFeatureSet: PropTypes.object.isRequired,
  selectedRowData: PropTypes.object.isRequired,
  setFeatureSets: PropTypes.func.isRequired,
  setSelectedFeatureSet: PropTypes.func.isRequired,
  setSelectedRowData: PropTypes.func.isRequired,
  tableContent: PropTypes.arrayOf(PropTypes.object).isRequired,
  urlTagOption: PropTypes.string,
  virtualizationConfig: VIRTUALIZATION_CONFIG.isRequired
}

export default FeatureSetsView
