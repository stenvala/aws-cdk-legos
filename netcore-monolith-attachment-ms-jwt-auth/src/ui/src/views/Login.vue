<style scoped>
  input {    
    margin-right: 20px;
  }
  .red {
    color: red;
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

    <p class="red" v-if="isInvalidCredentials">Authentication failed</p>
        
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
  username = '';
  password = '';
  isInvalidCredentials = false;
  get url() {    
    return (this as any).$store.state.monoApi + 'api/auth/login';
  }

  doLogin  () {        
    axios
      .post(this.url, {username: this.username, password: this.password})
      .then(response => {            
        (this as any).$store.state.isLoggedIn = true;
        console.log('Logged in successfully');
        (this as any).$router.push('/documents')
      })
      .catch(response => {
        this.username = '';
        this.password = '';
        this.isInvalidCredentials = true;
        console.log('Failed to log in');        
      });
  }
}
</script>