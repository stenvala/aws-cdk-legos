<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |          
      <router-link to="/login" v-if="!isLoggedIn">Login</router-link>
      <span v-if="isLoggedIn">
        <router-link to="/documents">Documents</router-link> | 
        <a href="javascript:void(0)" v-on:click="doLogout">Logout</a>
      </span>      
    </div>
    <router-view/>
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>

<script lang="ts">

export default {
  computed: {
    isLoggedIn() {
      return (this as any).$store.state.isLoggedIn;
    }
  },
  methods: {
    doLogout() {
      console.log('Logging out');
      (this as any).$store.state.isLoggedIn = false;
      (this as any).$store.state.permissions = undefined;
      (this as any).$router.push('/');
    }
  }
}



</script>
