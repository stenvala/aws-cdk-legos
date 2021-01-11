<style scoped>
  input {    
    margin-right: 20px;
  }
  .cap {
    text-transform: capitalize;
  }
</style>

<template>
  <div>
    <h1>{{name}}</h1>        

    <p>
      Server base at <code>{{ url }}</code>
    </p>

    <p v-if="!displayJwt"> 
      Loading JWT...
    </p>

    <div v-if="displayJwt"> 
      <!--
      <p>
        JWT<br><code>{{ displayJwt }}</code>
      </p>
      -->

      <button v-on:click="loadFiles">Load files</button>
      <br>

      
      <div v-if="areas.length > 0">      
        <div v-for="i in areas" :key="i.name">
          <h2 class="cap">{{i.name}}</h2>
          <p v-if="i.allowAdd">You may add</p>
          <p v-if="i.allowAdd">You may delete</p>      
          <div v-for="k in i.files" :key="k.path">
            <p>
              <a href="javascript:void(0)" v-on:click="loadFile(k)">{{k.name}}</a> {{k.lastModified}} {{k.size}}
            </p>
          </div>
        </div>
      </div>        
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { getAmisAxiosClient, getMonoAxiosClient } from '../util';

interface FileDTO {
  lastModified: number;
  path: string;
  size: number;
}

interface File {  
  area: string;
  lastModified: string;
  path: string;
  size: string;
  name: string;
}

interface Area {
  name: string;
  allowAdd: boolean;
  allowDelete: boolean;
  files: File[]
}

@Component({
  components: {
  },
})
export default class Document extends Vue {

  name: string = '';  
  private id = '';
  private jwt = '';
  displayJwt = '';
  areas: Area[] = [];


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
    const document = (this as any).$store.state.documents.find((i: any) => i.id === this.id);
    if (!document) {
      console.log('Must redirect to documents');
      (this as any).$router.push('/documents')
      return;
    }
    this.name = document.name;
    this.getJwt(this.id)
  }

  async loadFiles() {
    const response : FileDTO[] = (await getAmisAxiosClient(this.jwt)
      .get(this.getBase() + '/files/document/' + this.id)).data;      
    const files : File[] = response.map(i => {
      const parts = i.path.split('/');      
      return {
        lastModified: new Date(i.lastModified).toLocaleDateString() + ' ' + new Date(i.lastModified).toLocaleTimeString(),
        area: parts[1],
        name: parts[2],
        path: i.path,
        size: i.size.toString() // Should be formatted nicely
        }
      });
    const perm = (this as any).$store.state.permissions;      
    const areas = Object.keys(perm);
    this.areas = areas.map((i: string) => {              
      const area = i.replace('Permissions','');        
      return {
          name: area,
          files: files.filter(j => j.area === area),
          allowAdd: perm[i].indexOf('ADD') !== -1,
          allowDelete: perm[i].indexOf('DELETE') !== -1
        } 
      });      
  }

  public async loadFile(f: File) {
    console.log('Reqeust file load for ' + f.path);
    const response : any = await getAmisAxiosClient(this.jwt)
      .get(this.getBase() + '/files/document/' + this.id + '/area/' + f.area + '/file/' + f.name);      
    const url = response.data.url;
    window.open(url);
  }


  private async getJwt(id: string) {    
    console.log('Loading jwt for this document');
    const response: any = await getMonoAxiosClient((this as any).$store)
      .get(this.getMonoBase() + '/auth/permissions-jwt/' + id)    
    this.jwt = response.data.jwt;
    this.displayJwt = this.jwt.match(/.{1,50}/g)?.join(' ') || '';    
  }

  private addFile() {

  }

  private deleteFile() {

  }

}
</script>
