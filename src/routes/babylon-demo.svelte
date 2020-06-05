<script context="module">
  // import SSR from "../babylon/ssr";

  // export async function preload(page, session) {
  //   const demo = new SSR();
  //   demo.setup();

  //   return { demo };
  // }
</script>

<script>
  import { onMount } from "svelte/internal";
  import Demo from "../babylon/demo";
  import { zoom } from "../stores/zoom";
  let canvas;

  onMount(async () => {
    const demo = new Demo(canvas, zoom);
    demo.setup();
    demo.run();
  });

  function zoomIn() {
    zoom.update(zoom => zoom + 0.1);
  }

  function zoomOut() {
    zoom.update(zoom => zoom - 0.1);
  }

  function handleWheel(evt) {
    zoom.update(zoom => zoom - evt.deltaY / 4000);
  }
</script>

<style>
  canvas {
    width: 100%;
    height: 100%;
  }
</style>

<canvas bind:this={canvas} on:wheel={handleWheel} />

<button on:click={zoomIn}>Zoom In</button>
<button on:click={zoomOut}>Zoom Out</button>
