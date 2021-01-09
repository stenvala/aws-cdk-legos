<style scoped>
  input {    
    margin-right: 20px;
  }
</style>

<template>
  <div>
    <h1>{{name}}</h1>        

    <p>
      Server base at <code>{{ url }}</code>
    </p>

    <p>
      JWT<br><code>{{ displayJwt }}</code>
    </p>

    <button v-on:click="callDemo">Demo request</button>
    <br>
    To be added: File list for different cats, Add file, Delete file

  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { getAmisAxiosClient, getMonoAxiosClient } from '../util';

@Component({
  components: {
  },
})
export default class Document extends Vue {

  name: string = '';  
  private id = '';
  private jwt = '';
  displayJwt = '';

  private getBase() {    
    return (this as any).$store.state.amisApi + 'api';
  }

  private getMonoBase() {    
    return (this as any).$store.state.monoApi + 'api';
  }

  get documents() {
    return (this as any).$store.state.documents;
  }  

  get url() {    
    return (this as any).$store.state.monoApi + 'api/';
  }

  constructor() {
    super();        
    if (!(this as any).$store.state.isLoggedIn) {
      console.log('Must redirect to login');
      (this as any).$router.push('/login')
      return;
    }
    
    this.id = (this as any).$route.params.id;
    console.log(this.id)
    const document = (this as any).$store.state.documents.find((i: any) => i.id === this.id);
    if (!document) {
      console.log('Must redirect to documents');
      (this as any).$router.push('/documents')
      return;
    }
    this.name = document.name;
    this.getJwt(this.id)
  }

  async callDemo() {
    await getAmisAxiosClient(this.jwt)
      .get(this.getBase() + '/values');      
  }

  private async getJwt(id: string) {    
    const response: any = await getMonoAxiosClient((this as any).$store)
      .get(this.getMonoBase() + '/auth/permissions-jwt/' + id)    
    this.jwt = response.data.jwt;
    this.displayJwt = this.jwt.match(/.{1,50}/g)?.join(' ') || '';    
  }

  private loadFiles() {

  }

  private addFile() {

  }

  private deleteFile() {

  }

}
</script>
