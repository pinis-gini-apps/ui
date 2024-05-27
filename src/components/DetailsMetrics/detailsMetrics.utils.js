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
import { chain } from 'lodash'

const mlrunInfra = 'mlrun-infra'
const metricsColorsByFullName = {}
const usedColors = new Set()

const driftStatusConfig = {
  0: {
    color: 'no_drift',
    text: 'No drift'
  },
  1: {
    color: 'possible_drift',
    text: 'Possible drift'
  },
  2: {
    color: 'drift_detected',
    text: 'Drift detected'
  },
  '-1': {
    color: 'no_status',
    text: 'No status'
  }
}

const hslToHex = (hue, saturation, lightness) => {
  const normalizedLightness = lightness / 100
  const chroma = (saturation * Math.min(normalizedLightness, 1 - normalizedLightness)) / 100

  const calculateColorComponent = step => {
    const rotation = (step + hue / 30) % 12
    const color =
      normalizedLightness - chroma * Math.max(Math.min(rotation - 3, 9 - rotation, 1), -1)

    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }

  return `#${calculateColorComponent(0)}${calculateColorComponent(8)}${calculateColorComponent(4)}`
}

const getRandomHexColor = () => {
  const hue = Math.floor(Math.random() * 361)
  const saturation = Math.floor(Math.random() * 56) + 45
  const lightness = Math.floor(Math.random() * 71)

  return hslToHex(hue, saturation, lightness)
}

const setMetricColorByFullName = (name, color) => {
  metricsColorsByFullName[name] = color
}

const generateUniqueColor = () => {
  for (;;) {
    let color = getRandomHexColor()

    if (!usedColors.has(color)) {
      usedColors.add(color)

      return color
    }
  }
}

export const getMetricColorByFullName = name => {
  if (metricsColorsByFullName[name]) {
    return metricsColorsByFullName[name]
  } else {
    const newColor = generateUniqueColor()

    setMetricColorByFullName(name, newColor)

    return newColor
  }
}

export const generateMetricsItems = metrics => {
  return chain(metrics)
    .filter(metric => metric.app !== mlrunInfra)
    .sortBy(metric => metric.label)
    .map(metric => {
      return {
        ...metric,
        color: getMetricColorByFullName(metric.full_name),
        id: metric.full_name
      }
    })
    .value()
}

const getMetricTitle = fullName =>
  fullName.substring(fullName.lastIndexOf('.') + 1).replace(/-/g, ' ')

const timeFormatters = {
  hours: {
    formatMetricsTime: dates => {
      const options = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }
      return dates.map(([date]) => new Date(date).toLocaleTimeString('en-US', options))
    }
  },
  days: {
    formatMetricsTime: dates => {
      const options = {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
      }
      return dates.map(([date]) => new Date(date).toLocaleDateString('en-US', options))
    }
  }
}

export const formatNumber = num => {
  if (num >= 1e6) {
    return (num / 1e6).toFixed(0) + 'M'
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(0) + 'k'
  } else {
    return num.toString()
  }
}

const getAppName = inputString => {
  const firstDotIndex = inputString.indexOf('.')
  if (firstDotIndex !== -1) {
    const secondDotIndex = inputString.indexOf('.', firstDotIndex + 1)
    if (secondDotIndex !== -1) {
      return inputString.substring(firstDotIndex + 1, secondDotIndex)
    } else {
      return ''
    }
  } else {
    return ''
  }
}

export const parseMetrics = (metric, timeUnit, id) => {
  const { full_name, values, type } = metric

  if (!metric.data || !values || !Array.isArray(values)) {
    return {
      metric,
      app: getAppName(full_name),
      title: getMetricTitle(full_name)
    }
  }

  const points = values.map(([_, value]) => parseFloat(value.toFixed(2)))
  if (type === 'result') {
    let drift = { status: -1 }
    const driftStatusList = values.map(([date, __, driftStatus], index) => {
      if (drift.status < driftStatus) drift = { driftStatus, index }
      return driftStatusConfig[driftStatus]
    })
    metric.driftStatusList = driftStatusList
    metric.totalDriftStatus = { ...driftStatusConfig[drift.driftStatus], index: drift.index }
  }

  const withInvocationRate = full_name.includes('invocations')

  const totalOrAvg = withInvocationRate
    ? formatNumber(points.reduce((sum, value) => sum + value, 0))
    : formatNumber((points.reduce((sum, value) => sum + value, 0) / points.length).toFixed(2))

  const modifiedMetric = {
    ...metric,
    app: getAppName(full_name),
    color: getMetricColorByFullName(full_name),
    id,
    labels: timeFormatters[timeUnit].formatMetricsTime(values),
    points,
    title: getMetricTitle(full_name),
    [withInvocationRate ? 'total' : 'avg']: totalOrAvg
  }

  return modifiedMetric
}
