import { build } from 'esbuild'

function vitePluginCreateServiceWorker()
{
  return {
    name: 'create-service-worker',
    apply: 'build',
  }
}

export default vitePluginCreateServiceWorker
