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

import CreateFeatureVectorPopUp from '../../../elements/CreateFeatureVectorPopUp/CreateFeatureVectorPopUp'
import FeatureActionBar from '../../FeatureActionBar/FeatureActionBar'
import FeatureStoreTableRow from '../../../elements/FeatureStoreTableRow/FeatureStoreTableRow'
import FeatureStoreTabs from '../FeatureStoreTabs/FeaturePageTabs'
import NoData from '../../../common/NoData/NoData'
import Table from '../../Table/Table'

import { FEATURE_FILTERS, FEATURE_STORE_PAGE, FEATURE_VECTORS_TAB } from '../../../constants'
import { PRIMARY_BUTTON } from 'igz-controls/constants'
import { VIRTUALIZATION_CONFIG } from '../../../types'
import { featureVectorsFilters } from './featureVectors.util'
import { getNoDataMessage } from '../../../utils/getNoDataMessage'
import { isRowRendered } from '../../../hooks/useVirtualization.hook'
import { createFeatureVectorTitle } from '../featureStore.util'

const FeatureVectorsView = React.forwardRef(
  (
    {
      actionsMenu,
      applyDetailsChanges,
      createFeatureVector,
      createVectorPopUpIsOpen,
      detailsFormInitialValues,
      featureStore,
      featureVectors,
      filtersStore,
      handleActionsMenuClick,
      handleExpandRow,
      handleRefresh,
      largeRequestErrorMessage,
      pageData,
      selectedFeatureVector,
      selectedRowData,
      setCreateVectorPopUpIsOpen,
      setFeatureVectors,
      setSelectedFeatureVector,
      setSelectedRowData,
      tableContent,
      virtualizationConfig,
      urlTagOption
    },
    { featureStoreRef, tableRef, tableBodyRef }
  ) => {
    return (
      <div className="feature-store" ref={featureStoreRef}>
        <div className="content__action-bar-wrapper">
          <FeatureStoreTabs />
          <FeatureActionBar
            actionButtons={[
              {
                variant: PRIMARY_BUTTON,
                label: createFeatureVectorTitle,
                className: 'action-button',
                onClick: handleActionsMenuClick
              }
            ]}
            features={featureVectors}
            filterMenuName={FEATURE_FILTERS}
            handleRefresh={handleRefresh}
            page={FEATURE_STORE_PAGE}
            setContent={setFeatureVectors}
            setSelectedRowData={setSelectedRowData}
            tab={FEATURE_VECTORS_TAB}
            urlTagOption={urlTagOption}
          />
        </div>
        {featureStore.loading ? null : featureVectors.length === 0 ? (
          <NoData
            message={getNoDataMessage(
              filtersStore,
              featureVectorsFilters,
              largeRequestErrorMessage,
              FEATURE_STORE_PAGE,
              FEATURE_VECTORS_TAB,
              FEATURE_FILTERS
            )}
          />
        ) : (
          <>
            <Table
              actionsMenu={actionsMenu}
              applyDetailsChanges={applyDetailsChanges}
              detailsFormInitialValues={detailsFormInitialValues}
              handleCancel={() => setSelectedFeatureVector({})}
              pageData={pageData}
              ref={{ tableRef, tableBodyRef }}
              retryRequest={handleRefresh}
              selectedItem={selectedFeatureVector}
              tab={FEATURE_VECTORS_TAB}
              tableClassName="feature-vectors-table"
              tableHeaders={tableContent[0]?.content ?? []}
              virtualizationConfig={virtualizationConfig}
            >
              {tableContent.map(
                (tableItem, index) =>
                  isRowRendered(virtualizationConfig, index) && (
                    <FeatureStoreTableRow
                      actionsMenu={actionsMenu}
                      handleExpandRow={handleExpandRow}
                      key={index}
                      pageTab={FEATURE_VECTORS_TAB}
                      rowIndex={index}
                      rowItem={tableItem}
                      selectedItem={selectedFeatureVector}
                      selectedRowData={selectedRowData}
                    />
                  )
              )}
            </Table>
          </>
        )}
        {createVectorPopUpIsOpen && (
          <CreateFeatureVectorPopUp
            closePopUp={() => {
              setCreateVectorPopUpIsOpen(false)
            }}
            createFeatureVector={createFeatureVector}
          />
        )}
      </div>
    )
  }
)

FeatureVectorsView.propTypes = {
  actionsMenu: PropTypes.array.isRequired,
  applyDetailsChanges: PropTypes.func.isRequired,
  createFeatureVector: PropTypes.func.isRequired,
  createVectorPopUpIsOpen: PropTypes.bool.isRequired,
  featureStore: PropTypes.object.isRequired,
  featureVectors: PropTypes.arrayOf(PropTypes.object).isRequired,
  filtersStore: PropTypes.object.isRequired,
  handleActionsMenuClick: PropTypes.func.isRequired,
  handleExpandRow: PropTypes.func.isRequired,
  handleRefresh: PropTypes.func.isRequired,
  largeRequestErrorMessage: PropTypes.string.isRequired,
  pageData: PropTypes.object.isRequired,
  selectedFeatureVector: PropTypes.object.isRequired,
  selectedRowData: PropTypes.object.isRequired,
  setCreateVectorPopUpIsOpen: PropTypes.func.isRequired,
  setFeatureVectors: PropTypes.func.isRequired,
  setSelectedFeatureVector: PropTypes.func.isRequired,
  setSelectedRowData: PropTypes.func.isRequired,
  tableContent: PropTypes.arrayOf(PropTypes.object).isRequired,
  urlTagOption: PropTypes.string,
  virtualizationConfig: VIRTUALIZATION_CONFIG.isRequired
}

export default FeatureVectorsView
