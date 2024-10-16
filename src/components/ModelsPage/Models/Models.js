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
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'
import { chain, isEmpty, isNil } from 'lodash'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import AddArtifactTagPopUp from '../../../elements/AddArtifactTagPopUp/AddArtifactTagPopUp'
import DeployModelPopUp from '../../../elements/DeployModelPopUp/DeployModelPopUp'
import ModelsView from './ModelsView'
import RegisterModelModal from '../../../elements/RegisterModelModal/RegisterModelModal'
import JobWizard from '../../JobWizard/JobWizard'

import './models.scss'
import cssVariables from './models.scss'

import {
  fetchArtifactsFunctions,
  fetchArtifactTags,
  fetchExpandedModel,
  fetchModels,
  removeModel,
  removeModels
} from '../../../reducers/artifactsReducer'
import {
  GROUP_BY_NAME,
  MODELS_PAGE,
  MODELS_TAB,
  TAG_FILTER_ALL_ITEMS,
  FILTER_MENU_MODAL,
  GROUP_BY_NONE,
  MODELS_FILTERS,
  REQUEST_CANCELED,
  MODEL_TYPE,
  FUNCTION_TYPE_SERVING
} from '../../../constants'
import {
  checkForSelectedModel,
  fetchModelsRowData,
  generateActionsMenu,
  generatePageData,
  getFeatureVectorData,
  handleApplyDetailsChanges,
  handleDeployModelFailure
} from './models.util'
import detailsActions from '../../../actions/details'
import { createModelsRowData } from '../../../utils/createArtifactsContent'
import { getArtifactIdentifier } from '../../../utils/getUniqueIdentifier'
import { getFilterTagOptions, setFilters } from '../../../reducers/filtersReducer'
import { getViewMode } from '../../../utils/helper'
import { isDetailsTabExists } from '../../../utils/link-helper.util'
import { openPopUp } from 'igz-controls/utils/common.util'
import { parseChipsData } from '../../../utils/convertChipsData'
import { setFullSelectedArtifact } from '../../../utils/artifacts.util'
import { setNotification } from '../../../reducers/notificationReducer'
import { useGroupContent } from '../../../hooks/groupContent.hook'
import { useMode } from '../../../hooks/mode.hook'
import { useModelsPage } from '../ModelsPage.context'
import { useSortTable } from '../../../hooks/useSortTable.hook'
import { useVirtualization } from '../../../hooks/useVirtualization.hook'
import { useInitialTableFetch } from '../../../hooks/useInitialTableFetch.hook'

const Models = ({ fetchModelFeatureVector }) => {
  const [models, setModels] = useState([])
  const [requestErrorMessage, setRequestErrorMessage] = useState('')
  const [maxArtifactsErrorIsShown, setMaxArtifactsErrorIsShown] = useState(false)
  const [selectedModel, setSelectedModel] = useState({})
  const [selectedModelMin, setSelectedModelMin] = useState({})
  const [selectedRowData, setSelectedRowData] = useState({})
  //temporarily commented till ML-5606 will be done
  // const [metricsCounter, setMetricsCounter] = useState(0)
  // const [dataIsLoaded, setDataIsLoaded] = useState(false)
  // const [tableHeaders, setTableHeaders] = useState([])
  const artifactsStore = useSelector(store => store.artifactsStore)
  const detailsStore = useSelector(store => store.detailsStore)
  const filtersStore = useSelector(store => store.filtersStore)
  const frontendSpec = useSelector(store => store.appStore.frontendSpec)
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const viewMode = getViewMode(window.location.search)
  const { toggleConvertedYaml } = useModelsPage()

  const abortControllerRef = useRef(new AbortController())
  const tagAbortControllerRef = useRef(new AbortController())
  const modelsRef = useRef(null)

  const modelsFilters = useMemo(
    () => ({ name: filtersStore.name, ...filtersStore[FILTER_MENU_MODAL][MODELS_FILTERS].values }),
    [filtersStore]
  )
  const { isDemoMode } = useMode()

  const pageData = useMemo(
    () => generatePageData(selectedModel, viewMode),
    [selectedModel, viewMode]
  )

  const detailsFormInitialValues = useMemo(
    () => ({
      tag: selectedModel.tag ?? '',
      labels: parseChipsData(selectedModel.labels ?? {}, frontendSpec.internal_labels)
    }),
    [frontendSpec.internal_labels, selectedModel.labels, selectedModel.tag]
  )

  const getAndSetSelectedArtifact = useCallback(() => {
    setFullSelectedArtifact(
      MODELS_TAB,
      dispatch,
      navigate,
      selectedModelMin,
      setSelectedModel,
      params.projectName
    )
  }, [dispatch, navigate, params.projectName, selectedModelMin])

  useEffect(() => {
    getAndSetSelectedArtifact()
  }, [getAndSetSelectedArtifact])

  const fetchData = useCallback(
    async filters => {
      abortControllerRef.current = new AbortController()

      return dispatch(
        fetchModels({
          project: params.projectName,
          filters,
          config: {
            ui: {
              controller: abortControllerRef.current,
              setRequestErrorMessage
            },
            params: { format: 'minimal' }
          }
        })
      )
        .unwrap()
        .then(result => {
          if (result) {
            setModels(result)
            setMaxArtifactsErrorIsShown(result.length === 1000)
          }

          return result
        })
    },
    [dispatch, params]
  )

  const fetchTags = useCallback(() => {
    tagAbortControllerRef.current = new AbortController()

    return dispatch(
      getFilterTagOptions({
        dispatch,
        fetchTags: fetchArtifactTags,
        project: params.projectName,
        category: MODEL_TYPE,
        config: {
          signal: tagAbortControllerRef.current.signal
        }
      })
    )
  }, [dispatch, params.projectName])

  const handleDeployModel = useCallback(
    model => {
      abortControllerRef.current = new AbortController()

      dispatch(
        fetchArtifactsFunctions({
          project: model.project,
          filters: {},
          config: {
            signal: abortControllerRef.current.signal,
            params: { format: 'minimal' }
          }
        })
      )
        .unwrap()
        .then(functions => {
          if (!isNil(functions)) {
            const functionOptions = chain(functions)
              .filter(func => func.type === FUNCTION_TYPE_SERVING && func.graph?.kind === 'router')
              .uniqBy('name')
              .map(func => ({ label: func.name, id: func.name }))
              .value()

            if (functionOptions.length > 0) {
              openPopUp(DeployModelPopUp, {
                model,
                functionList: functions,
                functionOptionList: functionOptions
              })
            } else {
              handleDeployModelFailure(params.projectName, model.db_key)
            }
          }
        })
    },
    [dispatch, params.projectName]
  )

  const handleRefresh = useCallback(
    filters => {
      fetchTags()
      setSelectedRowData({})
      setSelectedModelMin({})
      setModels([])
      //temporarily commented till ML-5606 will be done
      // setTableHeaders([])
      // setDataIsLoaded(false)

      return fetchData(filters)
    },
    [fetchData, fetchTags]
  )

  const handleAddTag = useCallback(
    artifact => {
      openPopUp(AddArtifactTagPopUp, {
        artifact,
        onAddTag: () => handleRefresh(modelsFilters),
        getArtifact: () =>
          fetchExpandedModel({
            project: params.projectName,
            model: artifact.db_key,
            iter: true,
            tag: TAG_FILTER_ALL_ITEMS
          }),
        projectName: params.projectName
      })
    },
    [handleRefresh, params.projectName, modelsFilters]
  )

  const actionsMenu = useMemo(
    () => (modelMin, menuPosition) =>
      generateActionsMenu(
        modelMin,
        frontendSpec,
        dispatch,
        toggleConvertedYaml,
        handleAddTag,
        params.projectName,
        handleRefresh,
        modelsFilters,
        handleDeployModel,
        menuPosition,
        selectedModel
      ),
    [
      dispatch,
      frontendSpec,
      handleAddTag,
      handleDeployModel,
      handleRefresh,
      modelsFilters,
      params.projectName,
      toggleConvertedYaml,
      selectedModel
    ]
  )

  const handleRemoveRowData = useCallback(
    model => {
      const newStoreSelectedRowData = {
        ...artifactsStore.models.selectedRowData
      }
      const newPageDataSelectedRowData = { ...selectedRowData }

      delete newStoreSelectedRowData[model.data.ui.identifier]
      delete newPageDataSelectedRowData[model.data.ui.identifier]

      dispatch(removeModel(newStoreSelectedRowData))
      setSelectedRowData(newPageDataSelectedRowData)
    },
    [artifactsStore.models.selectedRowData, dispatch, selectedRowData]
  )

  const handleRequestOnExpand = useCallback(
    async model => {
      await fetchModelsRowData(
        dispatch,
        model,
        setSelectedRowData,
        modelsFilters.iter,
        modelsFilters.tag,
        params.projectName,
        frontendSpec
        //temporarily commented till ML-5606 will be done
        // metricsCounter
      )
    },
    [dispatch, modelsFilters.iter, modelsFilters.tag, params.projectName, frontendSpec]
  )

  const { latestItems, handleExpandRow } = useGroupContent(
    models,
    getArtifactIdentifier,
    handleRemoveRowData,
    handleRequestOnExpand,
    null,
    MODELS_PAGE,
    MODELS_TAB
  )

  const tableContent = useMemo(() => {
    return filtersStore.groupBy === GROUP_BY_NAME
      ? latestItems.map(contentItem => {
          return createModelsRowData(contentItem, params.projectName, frontendSpec, null, true)
        })
      : models.map(contentItem =>
          createModelsRowData(contentItem, params.projectName, frontendSpec)
        )
  }, [filtersStore.groupBy, frontendSpec, latestItems, models, params.projectName])

  const tableHeaders = useMemo(() => tableContent[0]?.content ?? [], [tableContent])

  const { sortTable, selectedColumnName, getSortingIcon, sortedTableContent, sortedTableHeaders } =
    useSortTable({
      headers: tableHeaders,
      content: tableContent,
      sortConfig: { excludeSortBy: 'labels', defaultSortBy: 'updated', defaultDirection: 'desc' }
    })

  const applyDetailsChanges = useCallback(
    changes => {
      return handleApplyDetailsChanges(
        changes,
        params.projectName,
        selectedModel,
        setNotification,
        dispatch
      )
    },
    [dispatch, params.projectName, selectedModel]
  )

  const applyDetailsChangesCallback = changes => {
    if ('tag' in changes.data) {
      setSelectedRowData({})
      setModels([])

      if (changes.data.tag.currentFieldValue) {
        navigate(
          `/projects/${params.projectName}/${MODELS_PAGE.toLowerCase()}/${MODELS_TAB}/${
            params.name
          }/${changes.data.tag.currentFieldValue}/overview`,
          { replace: true }
        )
      }
    }

    handleRefresh(modelsFilters)
  }

  useInitialTableFetch({
    createRowData: rowItem => createModelsRowData(rowItem, params.projectName, frontendSpec),
    fetchData,
    fetchTags,
    filterMenuName: MODELS_FILTERS,
    filters: modelsFilters,
    setExpandedRowsData: setSelectedRowData,
    sortExpandedRowsDataBy: 'updated'
  })

  useEffect(() => {
    if (params.name && params.tag && pageData.details.menu.length > 0) {
      isDetailsTabExists(params.tab, pageData.details.menu, navigate, location)
    }
  }, [navigate, location, pageData.details.menu, params.name, params.tag, params.tab])

  useEffect(() => {
    const tagAbortControllerCurrent = tagAbortControllerRef.current

    return () => {
      setModels([])
      dispatch(removeModels())
      setSelectedModelMin({})
      setSelectedRowData({})
      //temporarily commented till ML-5606 will be done
      // setTableHeaders([])
      // setDataIsLoaded(false)
      abortControllerRef.current.abort(REQUEST_CANCELED)
      tagAbortControllerCurrent.abort(REQUEST_CANCELED)
    }
  }, [dispatch, params.projectName, setModels, tagAbortControllerRef])

  useEffect(() => {
    dispatch(setFilters({ groupBy: GROUP_BY_NONE }))
  }, [dispatch, params.projectName])

  useEffect(() => {
    checkForSelectedModel(
      params.name,
      selectedRowData,
      models,
      params.tag,
      params.iter,
      params.uid,
      navigate,
      params.projectName,
      setSelectedModelMin
    )
  }, [
    models,
    navigate,
    params.iter,
    params.name,
    params.projectName,
    params.tag,
    params.uid,
    selectedRowData
  ])

  useEffect(() => {
    if (
      selectedModel.feature_vector &&
      !detailsStore.error &&
      isEmpty(detailsStore.modelFeatureVectorData)
    ) {
      const { name, tag } = getFeatureVectorData(selectedModel.feature_vector)
      fetchModelFeatureVector(params.projectName, name, tag)
    }
  }, [
    detailsStore.error,
    detailsStore.modelFeatureVectorData,
    fetchModelFeatureVector,
    params.projectName,
    selectedModel.feature_vector
  ])

  //temporarily commented till ML-5606 will be done
  // useEffect(() => {
  //   if (tableContent?.[0]?.content?.length > 0 && tableHeaders.length === 0) {
  //     setTableHeaders(tableContent?.[0]?.content)
  //   }
  // }, [tableContent, tableHeaders.length])

  // useEffect(() => {
  //   if (models.length > 0 && tableHeaders.length > 0 && !dataIsLoaded) {
  //     const newTableHeaders = []
  //     const maxMetricsModel = models.reduce((modelWithMaxMetrics, model) => {
  //       if (
  //         model.metrics &&
  //         Object.keys(model.metrics).length > Object.keys(modelWithMaxMetrics.metrics || {}).length
  //       ) {
  //         return model
  //       }
  //
  //       return modelWithMaxMetrics
  //     }, {})
  //     Object.keys(maxMetricsModel.metrics ?? {}).forEach(metricKey => {
  //       newTableHeaders.push({
  //         headerId: metricKey,
  //         headerLabel: metricKey,
  //         className: 'table-cell-1'
  //       })
  //     })
  //
  //     setMetricsCounter(Object.keys(maxMetricsModel.metrics ?? {}).length)
  //     setTableHeaders(state => [...state, ...newTableHeaders])
  //     setDataIsLoaded(true)
  //   }
  // }, [dataIsLoaded, models, tableHeaders])

  useEffect(() => setModels([]), [filtersStore.tag])

  const handleRegisterModel = useCallback(() => {
    openPopUp(RegisterModelModal, {
      params,
      refresh: () => handleRefresh(modelsFilters)
    })
  }, [handleRefresh, params, modelsFilters])

  const handleTrainModel = () => {
    openPopUp(JobWizard, {
      params,
      isTrain: true,
      wizardTitle: 'Train model'
    })
  }

  const virtualizationConfig = useVirtualization({
    rowsData: {
      content: sortedTableContent,
      expandedRowsData: selectedRowData,
      selectedItem: selectedModel
    },
    heightData: {
      headerRowHeight: cssVariables.modelsHeaderRowHeight,
      rowHeight: cssVariables.modelsRowHeight,
      rowHeightExtended: cssVariables.modelsRowHeightExtended
    },
    activateTableScroll: true
  })

  return (
    <ModelsView
      actionsMenu={actionsMenu}
      applyDetailsChanges={applyDetailsChanges}
      applyDetailsChangesCallback={applyDetailsChangesCallback}
      artifactsStore={artifactsStore}
      detailsFormInitialValues={detailsFormInitialValues}
      filtersStore={filtersStore}
      getAndSetSelectedArtifact={getAndSetSelectedArtifact}
      handleExpandRow={handleExpandRow}
      handleRefresh={handleRefresh}
      handleRegisterModel={handleRegisterModel}
      handleTrainModel={handleTrainModel}
      isDemoMode={isDemoMode}
      maxArtifactsErrorIsShown={maxArtifactsErrorIsShown}
      models={models}
      pageData={pageData}
      ref={{ modelsRef }}
      requestErrorMessage={requestErrorMessage}
      selectedModel={selectedModel}
      selectedRowData={selectedRowData}
      setMaxArtifactsErrorIsShown={setMaxArtifactsErrorIsShown}
      setModels={setModels}
      setSelectedModelMin={setSelectedModelMin}
      setSelectedRowData={setSelectedRowData}
      sortProps={{ sortTable, selectedColumnName, getSortingIcon }}
      tableContent={sortedTableContent}
      tableHeaders={sortedTableHeaders}
      viewMode={viewMode}
      virtualizationConfig={virtualizationConfig}
    />
  )
}

export default connect(null, {
  ...detailsActions
})(Models)
