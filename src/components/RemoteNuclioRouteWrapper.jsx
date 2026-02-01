/* mlrun-ui/src/components/RemoteNuclioRouteWrapper.tsx */
import React, { useEffect, useState, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { ensureNuclioRemote, loadNuclioApp } from '../utils/nuclio.remotes.utils'

const RemoteNuclioApp = React.lazy(() => loadNuclioApp())

const RemoteNuclioRouteWrapper = () => {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        await ensureNuclioRemote()
        setReady(true)
      } catch (err) {
        setError(true)
      }
    }
    void init()
  }, [])

  if (error) return <div>Failed to load Nuclio UI</div>
  if (!ready) return <div>Loading Nuclio...</div>

  return (
    <ErrorBoundary fallback={<div>Nuclio crashed</div>}>
      <Suspense fallback={<div>Loading Nuclio...</div>}>
        <div style={{ width: '100%', height: '1200px' }}>
          <RemoteNuclioApp />
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}

export default RemoteNuclioRouteWrapper
