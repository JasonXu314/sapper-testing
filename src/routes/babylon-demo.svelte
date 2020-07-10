<script context="module">
  export async function preload(page, session) {
    return {};
  }
</script>

<script>
  import { onMount } from "svelte";
  import Demo from "../babylon/demo";
  import GLTF from "../babylon/gltf";
  import { view } from "../stores/view";
  import { zoom } from "../stores/zoom";
  import MySocket from "../../util/MySocket";
  import axios from "axios";
  import papa from "papaparse";
  import ViewSelector from "../components/ViewSelector.svelte";
  import fps from "fps-indicator";

  let canvas;
  let connection;
  let msg = "";
  let data;
  let demo;

  onMount(async () => {
    const fpsMeter = fps({ period: 250, position: "bottom-right", max: 100 });

    try {
      const rawCSV = (await axios.get(
        "https://raw.githubusercontent.com/debugpoint136/chromosome-3d/master/IMR90_chr07-0-159Mb.csv"
      )).data
        .split("\n")
        .slice(1)
        .join("\n");
      const rawObj = papa.parse(rawCSV, { header: true });

      data = rawObj.data.map(item => ({
        chromosome: item["Chromosome index"],
        segment: item["Segment index"],
        x: item.X,
        y: item.Y,
        z: item.Z
      }));

      demo = new Demo(canvas, zoom, data.slice(0, 5));
      // demo = new GLTF(canvas);
      // demo.setup();
    } catch (error) {
      console.log(error);
      msg = `Error: ${error}`;
    }
  });

  view.subscribe(([begin, end]) => {
    if (demo) {
      demo.updateData(data.slice(begin, end));
    }
  });

  function expt() {
    if (demo) {
      demo.export();
    }
  }
</script>

<style>
  canvas {
    width: 100%;
    height: 100%;
  }
</style>

<canvas bind:this={canvas} />
<div>{msg}</div>
{#if data}
  <ViewSelector />
{/if}
<button on:click={expt}>Export</button>
