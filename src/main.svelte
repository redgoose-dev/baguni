<svelte:component this={layoutComponent}>
  <Router {routes}/>
</svelte:component>

<script>
import Router from 'svelte-spa-router'
import LayoutDefault from './components/layout/default.svelte'
import routes from './routes'

let layoutComponent = LayoutDefault
</script>
