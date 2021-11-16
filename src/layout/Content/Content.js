import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'

import Breadcrumbs from '../../common/Breadcrumbs/Breadcrumbs'
import YamlModal from '../../common/YamlModal/YamlModal'
import FilterMenu from '../../components/FilterMenu/FilterMenu'
import Table from '../../components/Table/Table'
import ContentMenu from '../../elements/ContentMenu/ContentMenu'
import NoData from '../../common/NoData/NoData'
import PageActionsMenu from '../../common/PageActionsMenu/PageActionsMenu'
import PreviewModal from '../../elements/PreviewModal/PreviewModal'

import {
  generateContentActionsMenu,
  generateGroupedItems
} from './content.util'
import { useYaml } from '../../hooks/yaml.hook'
import { useDemoMode } from '../../hooks/demoMode.hook'

import {
  ADD_TO_FEATURE_VECTOR_TAB,
  ARTIFACTS_PAGE,
  FEATURE_STORE_PAGE,
  FEATURE_VECTORS_TAB,
  FEATURES_TAB,
  FILES_PAGE,
  JOBS_PAGE,
  MODEL_ENDPOINTS_TAB,
  MODELS_PAGE,
  PROJECTS_PAGE
} from '../../constants'

import { ReactComponent as Yaml } from '../../images/yaml.svg'

import './content.scss'

const Content = ({
  applyDetailsChanges,
  artifactsStore,
  cancelRequest,
  children,
  content,
  filtersChangeCallback,
  filtersStore,
  getIdentifier,
  handleActionsMenuClick,
  handleCancel,
  handleSelectItem,
  header,
  loading,
  match,
  pageData,
  refresh,
  selectedItem,
  setLoading
}) => {
  const [convertedYaml, toggleConvertedYaml] = useYaml('')
  const [expandedItems, setExpandedItems] = useState([])
  const [expand, setExpand] = useState(false)
  const [groupedContent, setGroupedContent] = useState({})
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const isDemoMode = useDemoMode()

  const contentClassName = classnames(
    'content',
    [JOBS_PAGE, FEATURE_STORE_PAGE, MODELS_PAGE].includes(pageData.page) &&
      !match.path.includes(ADD_TO_FEATURE_VECTOR_TAB) &&
      'content_with-menu'
  )
  const filterMenuClassNames = classnames(
    'content__action-bar',
    pageData.hideFilterMenu && 'content__action-bar_hidden'
  )

  const actionsMenu = useMemo(() => {
    return generateContentActionsMenu(pageData.actionsMenu, [
      {
        label: 'View YAML',
        icon: <Yaml />,
        onClick: toggleConvertedYaml
      }
    ])
  }, [pageData.actionsMenu, toggleConvertedYaml])

  useEffect(() => {
    if (
      [
        PROJECTS_PAGE,
        ARTIFACTS_PAGE,
        FILES_PAGE,
        MODELS_PAGE,
        FEATURE_STORE_PAGE,
        JOBS_PAGE
      ].includes(pageData.page) &&
      ![FEATURES_TAB, MODEL_ENDPOINTS_TAB].includes(match.params.pageTab) &&
      (![FEATURE_VECTORS_TAB].includes(match.params.pageTab) || isDemoMode) &&
      !pageData.hidePageActionMenu
    ) {
      setShowActionsMenu(true)
    } else if (showActionsMenu) {
      setShowActionsMenu(false)
    }
  }, [
    isDemoMode,
    match.params.pageTab,
    pageData.hidePageActionMenu,
    pageData.page,
    showActionsMenu
  ])

  const handleGroupByName = useCallback(() => {
    setGroupedContent(
      generateGroupedItems(content, pageData.selectedRowData, getIdentifier)
    )
  }, [content, getIdentifier, pageData.selectedRowData])

  const handleGroupByNone = useCallback(() => {
    const rows = [...document.getElementsByClassName('parent-row')]

    rows.forEach(row => row.classList.remove('parent-row-expanded'))

    setExpand(false)
    setGroupedContent({})
  }, [])

  const handleGroupByWorkflow = useCallback(() => {
    const groupedItems = {}

    content.forEach(contentItem => {
      contentItem.labels.length > 0 &&
        contentItem.labels.forEach(label => {
          let workflowLabel = label.match('workflow')

          if (workflowLabel) {
            let workflowId = workflowLabel.input.slice('workflow'.length + 2)

            groupedItems[workflowId]
              ? groupedItems[workflowId].push(contentItem)
              : (groupedItems[workflowId] = [contentItem])
          }
        })
    })

    setGroupedContent(groupedItems)
  }, [content])

  useEffect(() => {
    if (filtersStore.groupBy === 'name') {
      handleGroupByName()
    } else if (filtersStore.groupBy === 'none') {
      handleGroupByNone()
    } else if (filtersStore.groupBy === 'workflow') {
      handleGroupByWorkflow()
    }

    return () => {
      setGroupedContent({})
      toggleConvertedYaml()
    }
  }, [
    handleGroupByName,
    handleGroupByWorkflow,
    handleGroupByNone,
    filtersStore.groupBy,
    toggleConvertedYaml
  ])

  useEffect(() => {
    return () => {
      setExpand(false)
      setExpandedItems([])
    }
  }, [match.params.jobId])

  const handleExpandRow = (e, item) => {
    const parentRow = e.target.closest('.parent-row')
    let newArray = []

    if (parentRow.classList.contains('parent-row-expanded')) {
      newArray = expandedItems.filter(expanded =>
        item.key?.value
          ? expanded.name !== item.key?.value
          : expanded.name !== item.name?.value
      )

      parentRow.classList.remove('parent-row-expanded')
      pageData.handleRemoveRequestData && pageData.handleRemoveRequestData(item)
    } else {
      parentRow.classList.remove('row_active')
      parentRow.classList.add('parent-row-expanded')
      pageData.handleRequestOnExpand && pageData.handleRequestOnExpand(item)
      newArray = [...expandedItems, item]
    }

    setExpandedItems(newArray)
    setExpand(newArray.length === Object.keys(groupedContent).length)
  }

  const handleExpandAll = collapseRows => {
    if (filtersStore.groupBy !== 'none') {
      const rows = [...document.getElementsByClassName('parent-row')]

      if (collapseRows || expand) {
        rows.forEach(row => row.classList.remove('parent-row-expanded'))

        setExpand(false)
      } else {
        rows.forEach(row => row.classList.add('parent-row-expanded'))

        setExpand(true)
      }
    }
  }

  return (
    <>
      <div className="content__header">
        {header ? header : <Breadcrumbs match={match} />}
        <PageActionsMenu
          actionsMenuHeader={pageData.actionsMenuHeader}
          onClick={handleActionsMenuClick}
          showActionsMenu={showActionsMenu}
        />
      </div>
      <div className={contentClassName}>
        {[JOBS_PAGE, FEATURE_STORE_PAGE, MODELS_PAGE].includes(pageData.page) &&
          !match.path.includes(ADD_TO_FEATURE_VECTOR_TAB) && (
            <ContentMenu
              activeTab={match.params.pageTab}
              match={match}
              screen={pageData.page}
              tabs={pageData.tabs}
            />
          )}
        <div className={filterMenuClassNames}>
          <FilterMenu
            actionButton={pageData.filterMenuActionButton}
            expand={expand}
            filters={pageData.filters}
            handleExpandAll={handleExpandAll}
            match={match}
            onChange={filtersChangeCallback ?? refresh}
            page={pageData.page}
            withoutExpandButton={
              Boolean(pageData.handleRequestOnExpand) ||
              pageData.withoutExpandButton
            }
          />
        </div>
        <div className="table-container">
          {children ? (
            children
          ) : loading ? null : (filtersStore.groupBy !== 'none' &&
              isEmpty(groupedContent)) ||
            content.length === 0 ? (
            <NoData message={pageData.noDataMessage} />
          ) : (
            <>
              <Table
                actionsMenu={actionsMenu}
                applyDetailsChanges={applyDetailsChanges}
                cancelRequest={cancelRequest}
                content={content}
                groupedContent={groupedContent}
                handleCancel={handleCancel}
                handleExpandRow={handleExpandRow}
                handleSelectItem={handleSelectItem}
                match={match}
                pageData={pageData}
                retryRequest={refresh}
                selectedItem={selectedItem}
                setLoading={setLoading}
              />
            </>
          )}
        </div>
        {convertedYaml.length > 0 && (
          <YamlModal
            convertedYaml={convertedYaml}
            toggleConvertToYaml={toggleConvertedYaml}
          />
        )}
      </div>
      {artifactsStore?.preview?.isPreview && (
        <PreviewModal item={artifactsStore?.preview?.selectedItem} />
      )}
    </>
  )
}

Content.defaultProps = {
  activeScreenTab: '',
  filtersChangeCallback: null,
  handleActionsMenuClick: () => {},
  handleCancel: () => {},
  handleSelectItem: () => {},
  selectedItem: {},
  setLoading: () => {}
}

Content.propTypes = {
  content: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  filtersChangeCallback: PropTypes.func,
  getIdentifier: PropTypes.func.isRequired,
  handleActionsMenuClick: PropTypes.func,
  handleCancel: PropTypes.func,
  handleSelectItem: PropTypes.func,
  loading: PropTypes.bool.isRequired,
  match: PropTypes.shape({}).isRequired,
  pageData: PropTypes.shape({}).isRequired,
  refresh: PropTypes.func.isRequired,
  selectedItem: PropTypes.shape({}),
  setLoading: PropTypes.func
}

export default connect(
  ({ artifactsStore, filtersStore }) => ({ artifactsStore, filtersStore }),
  null
)(Content)
