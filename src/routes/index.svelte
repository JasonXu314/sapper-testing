<script>
  import MySocket from "../../util/MySocket";
  import axios from "axios";

  let connection;
  let message = "";
  let messages = [];

  async function createConnection() {
    const PORT = (await axios.get("/port")).data;
    connection = new MySocket(
      `${location.protocol.replace("http", "ws")}//${location.hostname}:${PORT +
        2000}`
    );

    connection.on("open", () => {
      connection.json({
        message: "hi"
      });
    });

    connection.onMsg(msg => {
      if (msg.recieved) {
        messages = [...messages, msg.recieved];
      }
    });
  }

  function sendMsg(evt) {
    if (connection && connection.isReady()) {
      connection.send(message);
      message = "";
    }
  }
</script>

<style>
  h1,
  figure,
  p {
    text-align: center;
    margin: 0 auto;
  }

  h1 {
    font-size: 2.8em;
    text-transform: uppercase;
    font-weight: 700;
    margin: 0 0 0.5em 0;
  }

  figure {
    margin: 0 0 1em 0;
  }

  img {
    width: 100%;
    max-width: 400px;
    margin: 0 0 1em 0;
  }

  p {
    margin: 1em auto;
  }

  @media (min-width: 480px) {
    h1 {
      font-size: 4em;
    }
  }

  ul {
    list-style: none;
  }
</style>

<svelte:head>
  <title>Sapper project template</title>
</svelte:head>

<h1>Great success!</h1>

<figure>
  <img alt="Success Kid" src="successkid.jpg" />
  <figcaption>Have fun with Sapper!</figcaption>
</figure>

<p>
  <strong>
    Try editing this file (src/routes/index.svelte) to test live reloading.
  </strong>
</p>
<button on:click={createConnection}>Connect</button>

<input type="text" bind:value={message} />
<button on:click={sendMsg}>Send</button>
<ul>
  {#each messages as msg}
    <li>{msg}</li>
  {/each}
</ul>
