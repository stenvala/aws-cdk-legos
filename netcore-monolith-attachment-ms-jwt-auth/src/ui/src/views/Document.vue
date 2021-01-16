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

      <input v-on:change="selectedFile" id="file-input" type="file" name="name" style="display: none;" />
      
      <div v-if="areas.length > 0">      
        <div v-for="i in areas" :key="i.name">
          <h2 class="cap">{{i.name}}</h2>
          <p v-if="i.allowAdd">
            <a href="javascript:void(0)" v-on:click="addFile(i)">Add new</a>
          </p>
          <p v-if="i.allowDelete">You may delete any attachment</p>      
          <p v-if="i.allowDeleteMy">You may delete only attachments that you have added</p>      
          <div v-for="k in i.files" :key="k.path">
            <p>
              <a href="javascript:void(0)" v-on:click="loadFile(k)">{{k.name}}</a> {{k.lastModified}} {{k.size}}
              <a href="javascript:void(0)" v-on:click="deleteFile(k)" v-if="i.allowDelete">Delete</a>      
              <a href="javascript:void(0)" v-on:click="deleteFile(k, true)" v-if="i.allowDeleteMy && i.userId == myId">Delete</a>      
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
import axios from "axios";

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
  allowDeleteMy: Boolean;
  files: File[]
}

@Component({
  components: {
  },
})
export default class Document extends Vue {

  private addingTo: Area | undefined = undefined;
  name: string = '';  
  myId: string = '';
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
    this.myId = (this as any).$store.user.id;
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
        lastModified: new Date(i.lastModified*1000).toLocaleDateString() + ' ' + new Date(i.lastModified*1000).toLocaleTimeString(),
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
          allowDelete: perm[i].indexOf('DELETE') !== -1,
          allowDeleteMy: perm[i].indexOf('DELETE-MY') !== -1
        } 
      });      
  }

  public async loadFile(f: File) {
    console.log('Request file load for ' + f.path);
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

  async addFile(area: Area) {    
    this.addingTo = area;
    document.getElementById('file-input')?.click();
  }

  async selectedFile(event: any) {
    if (!this.addingTo) {
      return;
    }
    const file = event.target.files[0];      
    const data = {
      fileName: file.name,
      contentType: file.type
    }
    const response = await getAmisAxiosClient(this.jwt)
      .post(this.getBase() + '/files/document/' + this.id + '/area/' + this.addingTo.name, data);
    if (response.data && response.data.url) {
      const signedUrl = response.data.url;
      const options = {
          headers: {
            'Content-Type': file.type,
            'x-amz-meta-userid': this.myId // This is signed, can't be random
          }
        };
      await axios.put(signedUrl, file, options);
      this.loadFiles();
    }
  }

  async deleteFile(f: File, isMy = false) {
    const file = isMy ? 'my-file' : 'file';
    console.log('Delete file load for ' + f.path + ' at file path ' + file);
    await getAmisAxiosClient(this.jwt)
      .delete(this.getBase() + '/files/document/' + this.id + '/area/' + f.area + `/${file}/` + f.name);
    await this.loadFiles();  
    console.log('File deleted and new loaded');
  }

}
</script>
