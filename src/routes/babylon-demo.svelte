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
    const demo = new Demo(canvas, zoom);
    demo.setup();
    demo.run();
    connection = new MySocket(location.origin.replace("http", "ws"));

    connection.onMsg(msg => {
      if (msg.type === "ZOOM") {
        zoom.set(msg.zoom);
      } else if (msg.type === "INIT_ZOOM") {
        zoom.set(msg.zoom);
      }
    });
  });

  function zoomIn() {
    const newZoom = zoom + 0.1;
    connection.json({ type: "ZOOM", zoom: newZoom });
    return newZoom;
  }

  function zoomOut() {
    zoom.update(zoom => {
      const newZoom = zoom - 0.1;
      connection.json({ type: "ZOOM", zoom: newZoom });

      return newZoom;
    });
  }

  function handleWheel(evt) {
    zoom.update(zoom => {
      const newZoom = zoom - evt.deltaY / 4000;
      connection.json({ type: "ZOOM", zoom: newZoom });
      return newZoom;
    });
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
