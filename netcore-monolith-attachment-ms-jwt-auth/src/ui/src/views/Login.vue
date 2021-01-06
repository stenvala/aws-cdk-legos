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

    <p>
      End point at <code>{{ url }}</code>
    </p>

    <input placeholder="Username" v-model="username">
    
    <input type="password" placeholder="Password" v-model="password">
    
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
  username: string;
  password: string;
  url = 'http://localhost:6102/api/auth/login';
  doLogin  () {        
    axios
      .post(this.url, {username: this.username, password: this.password})
      .then(response => console.log(response))
  }
}
</script>