// import Breadcrumbs from '../../common/Breadcrumbs/Breadcrumbs'
// import Loader from '../../common/Loader/Loader'
import {
  DATES_FILTER,
  ENTITY_TYPE,
  EVENT_TYPE,
  // JOBS_MONITORING_PAGE,
  LABELS_FILTER,
  NAME_FILTER,
  PROJECT_FILTER,
  STATUS_FILTER
} from '../../constants'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
// import ProjectsAlertsFilters from './ProjectsAlertsFilters'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAlerts } from '../../reducers/alertsReducer'
import ProjectAlertsView from './ProjectsAlertsView'
import alertsData from './alertsData.json'
import { useParams } from 'react-router-dom'

const ProjectsAlerts = () => {
  // const [alerts, setAlerts] = useState(alertsData)
  const [alerts] = useState(alertsData)
  const [requestErrorMessage] = useState('')

  const params = useParams()
  const alertsStore = useSelector(state => state.alertsStore)
  const filtersStore = useSelector(store => store.filtersStore)

  const dispatch = useDispatch()
  // console.log(alertsStore.loading)
  const abortControllerRef = useRef(new AbortController())

  const alertsFiltersConfig = useMemo(() => {
    return {
      [NAME_FILTER]: { label: 'Name:' },
      [DATES_FILTER]: { label: 'Start time:' },
      [PROJECT_FILTER]: { label: 'Project:' },
      [STATUS_FILTER]: { label: 'Status:' },
      [ENTITY_TYPE]: { label: 'Entity Type:' },
      [EVENT_TYPE]: { label: 'Event Type' },
      [LABELS_FILTER]: { label: 'Labels:' }
    }
  }, [])

  // useEffect(() => {
  //   // Dispatch the fetchAlert action when the component mounts
  //   dispatch(fetchAlert({ project: 'Project123', filters: { status: 'active' } })).then(res =>
  //     console.log(res)
  //   )
  // }, [dispatch])

  const fetchData = useCallback(
    filters => {
      abortControllerRef.current = new AbortController()
      dispatch(fetchAlerts({ project: 'Project123', filters: { status: 'active' } })).then()
      // return dispatch(
      //   fetchDataSets({
      //     project: params.projectName,
      //     filters,
      //     config: {
      //       ui: {
      //         controller: abortControllerRef.current,
      //         setRequestErrorMessage
      //       },
      //       params: {
      //         format: 'minimal'
      //       }
      //     }
      //   })
      // )
      //   .unwrap()
      //   .then(result => {
      //     if (result) {
      //       setAlerts(result)
      //     }
      //
      //     return result
      //   })
    },
    [dispatch, params.projectName]
  )

  const refreshAlertsCallback = useCallback(
    filters => {
      // setAlerts([])
      console.log(filters)
      // return fetchData(filters)
    },
    [fetchData]
  )

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <ProjectAlertsView
      alerts={alerts}
      alertsFiltersConfig={alertsFiltersConfig}
      alertsStore={alertsStore}
      refreshAlertsCallback={refreshAlertsCallback}
      filtersStore={filtersStore}
      requestErrorMessage={requestErrorMessage}
    />
  )
}

export default ProjectsAlerts
