<script>
  import { onMount } from "svelte";
  import axios from "axios";

  let newTitle;
  let newTodo;

  function createTodo(evt) {
    evt.preventDefault();
    axios
      .post("http://localhost:3000/my-todos", {
        title: newTitle,
        description: newTodo
      })
      .then(() => {
        newTitle = "";
        newTodo = "";
        fetchTodos();
      });
  }

  let todos = [];
  let loading = false;

  function fetchTodos() {
    axios.get("http://localhost:3000/my-todos").then(res => {
      todos = res.data;
      loading = false;
    });
    loading = true;
  }

  function deleteTodo(evt) {
    axios
      .delete("http://localhost:3000/my-todos", {
        data: {
          id: parseInt(evt.target.dataset.id)
        }
      })
      .then(() => {
        fetchTodos();
      });
  }

  onMount(fetchTodos);
</script>

<style>
  .todos-list .todo {
    display: grid;
    grid-template: "title del" "description del" / 9fr 1fr;
  }

  .todos-list .todo .todo-title {
    grid-area: title;
  }

  .todos-list .todo .todo-text {
    grid-area: description;
  }

  .todos-list .todo .del-button {
    grid-area: del;
    margin: auto;
    height: 30px;
    width: 30px;
    border-radius: 50%;
    background-color: red;
    border: 1px solid darkred;
    color: white;
    font-size: 15px;
    cursor: pointer;
  }
</style>

<div class="todos-list">
  <form on:submit={createTodo}>
    <div>
      <input
        type="text"
        name="title"
        id="title"
        class="todo-input"
        placeholder="title"
        autocomplete="off"
        bind:value={newTitle} />
    </div>
    <div>
      <input
        type="text"
        name="todo"
        id="todo"
        class="todo-input"
        placeholder="description"
        autocomplete="off"
        bind:value={newTodo} />
    </div>
    <button type="submit">Create!</button>
  </form>
  {#if loading}
    <div>Loading todos...</div>
  {/if}
  {#each todos as todo}
    <div class="todo">
      <h1 class="todo-title">{todo.title}</h1>
      <p class="todo-text">{todo.description}</p>
      <button class="del-button" data-id={todo.id} on:click={deleteTodo}>
        x
      </button>
    </div>
  {/each}
</div>
