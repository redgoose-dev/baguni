import { build } from 'esbuild-wasm'

function vitePluginCreateServiceWorker()
{
  return {
    name: 'create-service-worker',
    apply: 'build',
  }
}

export default vitePluginCreateServiceWorker
