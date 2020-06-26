<script>
  import { view } from "../stores/view";

  let startVal, stopVal;

  view.subscribe(([begin, end]) => {
    startVal = begin;
    stopVal = end;
  });

  function setStart(evt) {
    view.update(([, end]) => [parseInt(evt.target.value), end]);
  }

  function setEnd(evt) {
    view.update(([start]) => [start, parseInt(evt.target.value)]);
  }
</script>

<style>
  .container {
    border: 1px solid black;
    padding: 1em;
  }

  .row {
    display: flex;
    flex-direction: row;
    align-content: flex-start;
  }
</style>

<div class="container">
  <div class="row">
    <label for="start">Start:&nbsp;</label>
    <input id="start" type="text" on:blur={setStart} value={startVal} />
  </div>
  <div class="row">
    <label for="stop">Stop:&nbsp;</label>
    <input id="stop" type="text" on:blur={setEnd} value={stopVal} />
  </div>
</div>
