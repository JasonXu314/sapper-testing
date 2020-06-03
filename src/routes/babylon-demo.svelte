<script>
  import Demo from "./babylon/_demo";
  import { onMount } from "svelte/internal";

  let canvas;

  onMount(async () => {
    const demo = new Demo(canvas);

    demo.setup();
    demo.run();
  });
</script>

<style>
  canvas {
    width: 100%;
    height: 100%;
  }
</style>

<canvas bind:this={canvas} />
