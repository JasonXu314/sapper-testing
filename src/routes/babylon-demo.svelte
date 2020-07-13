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

  onMount(() => {
    const fpsMeter = fps({ period: 250, position: "bottom-right", max: 100 });
  });

  view.subscribe(([begin, end]) => {
    if (demo) {
      demo.updateData(data.slice(begin, end));
    }
  });

  function expt() {
    if (demo) {
      demo.export().then(data => {
        demo.destroy();

        demo = new GLTF(canvas);
        demo.setup(data.data, data.bin);
      });
    }
  }

  async function def() {
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
    } catch (error) {
      console.log(error);
      msg = `Error: ${error}`;
    }
  }

  async function load() {
    // const glb = (await axios.get("http://localhost:3000/glb")).data.glb;
    const data = (await axios.get("http://localhost:3000/gltf")).data;

    demo = new GLTF(canvas);
    demo.setup(data.gltf, data.bin);
  }

  function encode(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
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
<button on:click={def}>Default</button>
<button on:click={load}>Load from Serialized</button>
