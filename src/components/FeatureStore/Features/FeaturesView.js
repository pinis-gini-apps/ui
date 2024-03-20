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

import NoData from '../../../common/NoData/NoData'
import Table from '../../Table/Table'
import FeatureStoreTableRow from '../../../elements/FeatureStoreTableRow/FeatureStoreTableRow'
import FeatureStoreTabs from '../FeatureStoreTabs/FeaturePageTabs'
import FeatureActionBar from '../../FeatureActionBar/FeatureActionBar'

import { SECONDARY_BUTTON } from 'igz-controls/constants'
import { featuresFilters } from './features.util'
import { FEATURE_FILTERS, FEATURE_STORE_PAGE, FEATURES_TAB } from '../../../constants'
import { getNoDataMessage } from '../../../utils/getNoDataMessage'

const FeaturesView = React.forwardRef(
  (
    {
      actionsMenu,
      features,
      featureStore,
      filtersStore,
      getPopUpTemplate,
      handleExpandRow,
      handleRefresh,
      largeRequestErrorMessage,
      pageData,
      selectedRowData,
      setFeatures,
      setSelectedRowData,
      tableContent,
      tableStore,
      urlTagOption
    },
    ref
  ) => {
    return (
      <div className="feature-store" ref={ref}>
        <div className="content__action-bar-wrapper">
          <FeatureStoreTabs />
          <div className="content__action-bar-wrapper">
            <FeatureActionBar
              actionButtons={[
                {
                  className: 'action-button',
                  label: 'Add to feature vector',
                  onClick: getPopUpTemplate,
                  popupButton: true,
                  variant: SECONDARY_BUTTON
                }
              ]}
              features={features}
              filterMenuName={FEATURE_FILTERS}
              handleRefresh={handleRefresh}
              page={FEATURE_STORE_PAGE}
              setContent={setFeatures}
              setSelectedRowData={setSelectedRowData}
              tab={FEATURES_TAB}
              urlTagOption={urlTagOption}
            />
          </div>
        </div>
        {featureStore.features.loading || featureStore.entities.loading ? null : features.length ===
          0 ? (
          <NoData
            message={getNoDataMessage(
              filtersStore,
              featuresFilters,
              largeRequestErrorMessage,
              FEATURE_STORE_PAGE,
              FEATURES_TAB
            )}
          />
        ) : (
          <>
            <Table
              actionsMenu={actionsMenu}
              hideActionsMenu={tableStore.isTablePanelOpen}
              pageData={pageData}
              retryRequest={handleRefresh}
              tab={FEATURES_TAB}
              tableHeaders={tableContent[0]?.content ?? []}
            >
              <>
                {tableContent.map((tableItem, index) => (
                  <FeatureStoreTableRow
                    actionsMenu={actionsMenu}
                    handleExpandRow={handleExpandRow}
                    key={index}
                    hideActionsMenu={tableStore.isTablePanelOpen}
                    mainRowItemsCount={2}
                    pageTab={FEATURES_TAB}
                    rowIndex={index}
                    rowItem={tableItem}
                    selectedRowData={selectedRowData}
                  />
                ))}
              </>
            </Table>
          </>
        )}
      </div>
    )
  }
)

FeaturesView.propTypes = {
  actionsMenu: PropTypes.array.isRequired,
  features: PropTypes.arrayOf(PropTypes.object).isRequired,
  featureStore: PropTypes.object.isRequired,
  filtersStore: PropTypes.object.isRequired,
  getPopUpTemplate: PropTypes.func.isRequired,
  handleExpandRow: PropTypes.func.isRequired,
  handleRefresh: PropTypes.func.isRequired,
  largeRequestErrorMessage: PropTypes.string.isRequired,
  pageData: PropTypes.object.isRequired,
  selectedRowData: PropTypes.object.isRequired,
  setFeatures: PropTypes.func.isRequired,
  setSelectedRowData: PropTypes.func.isRequired,
  tableContent: PropTypes.arrayOf(PropTypes.object).isRequired,
  tableStore: PropTypes.object.isRequired,
  urlTagOption: PropTypes.string
}

export default FeaturesView
