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
  import MySocket from "../../util/MySocket";

  let canvas;
  let connection;

  onMount(async () => {
    connection = new MySocket(location.origin.replace("http", "ws"));
    const demo = new Demo(canvas, zoom);
    demo.setup();
    demo.run();

    connection.onMsg(msg => {
      if (msg.type === "ZOOM") {
        zoom.set(msg.zoom);
      } else if (msg.type === "INIT_ZOOM") {
        zoom.set(msg.zoom);
      }
    });
  });
</script>

<style>
  canvas {
    width: 100%;
    height: 100%;
  }
</style>

<canvas bind:this={canvas} />
