import { loadRemote, registerRemotes } from '@module-federation/runtime'

let registerPromise = null

const ensureNuclioRemote = async () => {
  if (registerPromise) return registerPromise

  // Hardcoded value for the nuclio remote as requested. to be removed
  // const remoteEntryUrl = 'https://nuclio-ui.iguazio.vmdev210ig4.lab.iguazeng.com'

  const remoteEntryUrl = window?.mlrunConfig?.nuclioRemoteEntryUrl

  registerPromise = (async () => {
    try {
      registerRemotes([
        {
          name: 'nuclio',
          entry: `${remoteEntryUrl}/remoteEntry.js`,
          type: 'module',
          shareScope: 'default'
        }
      ])
    } catch (err) {
      registerPromise = null
      console.error('[MF] Registration failed:', err)
      throw err
    }
  })()

  return registerPromise
}

const loadNuclioApp = async () => {
  await ensureNuclioRemote()
  const module = await loadRemote('nuclio/App')

  if (!module) {
    throw new Error('[MF] Failed to load Nuclio application')
  }

  const component = module.default?.default || module.default || module
  return { default: component }
}

export { ensureNuclioRemote, loadNuclioApp }
