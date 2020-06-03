<script>
  import Nav from "../components/Nav.svelte";

  export let segment;
</script>

<style>
  main.page {
    position: relative;
    max-width: 56em;
    background-color: white;
    padding: 2em;
    margin: 0 auto;
    box-sizing: border-box;
  }

  main.babylon {
    width: 100%;
    height: 100%;
  }
</style>

<Nav {segment} />

{#if segment !== 'babylon-demo'}
  <main class="page">
    <slot />
  </main>
{:else}
  <main class="babylon">
    <slot />
  </main>
{/if}
