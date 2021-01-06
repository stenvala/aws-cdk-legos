<style scoped>
  input {    
    margin-right: 20px;
    }
</style>

<template>
  <div class="login">
    <!--
    <img alt="Vue logo" src="../assets/logo.png">
    -->
    <h1>Login here</h1>

    <input type="text" placeholder="Username">
    
    <input type="password" placeholder="Password">
    
    <button v-on:click="doLogin">Login</button>
  </div>
</template>


<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import axios from 'axios';
@Component({
  components: {    
  },
})
export default class Login extends Vue {
  doLogin  () {    
    const url = 'http://localhost:6102/api/auth/login'
    axios
      .post(url, {username: 'admin', password: 'demo'})
      .then(response => console.log(response))
  }
}
</script>