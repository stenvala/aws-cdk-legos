<style scoped>
  input {    
    margin-right: 20px;
  }
</style>

<template>
  <div>
    <h1>Documents</h1>
    <p>
      Server base at <code>{{ url }}</code>
    </p>
    <p>
      There are currently {{documents.length}} documents.
    </p>
    <h2>Add document</h2>

    <input placeholder="Give name" v-model="newDocumentName">    
    <button v-on:click="addDocument">Add</button>

    <div v-if="documents.length > 0">
      <h2>Existing documents</h2>      
      <p v-for="i in documents" :key="i.id">
        {{ i.name }}: 
        <a href="javascript:void(0)" v-on:click="seeFiles(i)">Files</a> | 
        <a href="javascript:void(0)" v-on:click="removeDocument(i)">Remove</a>
      </p>      
    </div>        

  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { getMonoAxiosClient } from '../util';

@Component({
  components: {
  },
})
export default class Documents extends Vue {

  newDocumentName = '';

  private getBase() {    
    return (this as any).$store.state.monoApi + 'api';
  }

  get documents() {
    return (this as any).$store.state.documents;
  }  

  get url() {    
    return this.getBase();
  }

  constructor() {
    super();        
    if (!(this as any).$store.state.isLoggedIn) {
      console.log('Must redirect to login');
      (this as any).$router.push('/login')
      return;
    }
    this.loadDocuments()
  }

  async addDocument() {
    const name = this.newDocumentName.trim();
    if (name === '') {
      console.info('Give name to add document');
      return;
    }
    this.newDocumentName = '';
    await getMonoAxiosClient((this as any).$store)
      .post(this.getBase() + '/documents', { name });      
    await this.loadDocuments();
  }

  seeFiles(document: any) {
    (this as any).$router.push('/document/' + document.id)
  }

  async removeDocument(document: any) {
    await getMonoAxiosClient((this as any).$store)
      .delete(this.getBase() + '/documents/' + document.id);      
    await this.loadDocuments();
  }

  private async loadDocuments() {
    console.log('Loading documents');    
    const response = await getMonoAxiosClient((this as any).$store)
      .get(this.getBase() + '/documents');      
    (this as any).$store.state.documents = response.data;      
  }


}
</script>
