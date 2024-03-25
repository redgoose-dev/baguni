<header>
  <h1>.header</h1>
  <nav>
    <a href="/" use:link>explorer</a>
    <a href="/collections" use:link>collections</a>
    <a href="/about" use:link>about</a>
  </nav>
</header>

<slot/>

<footer>
  .footer
</footer>

<script>
import { link } from 'svelte-spa-router'
</script>
