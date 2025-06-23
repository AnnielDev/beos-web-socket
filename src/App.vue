<template>
  <div>
    <h1>Formulario de Usuario</h1>

    <form @submit.prevent="handleSubmit">
      <label>
        Nombre:
        <input v-model="form.name" required />
      </label>
      <br />
      <label>
        Apellido:
        <input v-model="form.lastName" required />
      </label>
      <br />
      <label>
        Edad:
        <input v-model.number="form.age" type="number" required />
      </label>
      <br />
      <label>
        Sexo:
        <select v-model="form.sex" required>
          <option value="">Seleccionar</option>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
        </select>
      </label>
      <br />
      <button type="submit">Enviar</button>
    </form>

    <h2>Respuesta del WebSocket:</h2>
    <div v-if="user">
      <p><strong>Nombre:</strong> {{ user.name }}</p>
      <p><strong>Apellido:</strong> {{ user.lastName }}</p>
      <p><strong>Edad:</strong> {{ user.age }}</p>
      <p><strong>Sexo:</strong> {{ user.sex }}</p>
    </div>
    <p v-else>No hay datos recibidos aún.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { webSocketConnection, WebSocketClient } from "./utils/WebSocketConfig";
const form = ref({
  name: "",
  lastName: "",
  age: null,
  sex: "",
});

const user = ref(null);
const wsc = ref<WebSocketClient | null>(null);

const connectWS = () => {
  wsc.value = webSocketConnection({
    // url: "getClaims",
    // query: {
    //   id: "12345",
    //   name: "John Doe",
    //   code: "ABC123",
    // },
    // protocols: ["json", "graphql-ws"],
    handlers: {
      message: (data) => {
        user.value = data.data;
      },
      close: (e) => {
        alert("❌ Conexión WebSocket cerrada");
      },
    },
  });
};

const handleSubmit = () => {
  if (!wsc.value) return alert("❌ No hay conexión WebSocket activa");
  wsc.value.send(form.value);
};

onMounted(() => {
  connectWS();
});
</script>

<style scoped>
form {
  margin-bottom: 1rem;
}
input,
select {
  margin: 0.5rem 0;
}
</style>
