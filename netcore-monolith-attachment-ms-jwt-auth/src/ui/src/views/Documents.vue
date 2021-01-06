<template>
  <div>
    <h1>Documents</h1>
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

  private getBase() {    
    return (this as any).$store.state.monoApi + 'api';
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

  private loadDocuments() {
    console.log(this.getBase());
    getMonoAxiosClient((this as any).$store)
      .get(this.getBase() + '/documents')
      .then(response => {
        console.log(response);
      });

  }


}
</script>
