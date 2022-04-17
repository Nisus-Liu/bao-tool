<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <!--<HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/>-->
    <AButton type="primary" v-on:click="clickMe">点我</AButton>
    <Test1  default-value="let test='abc'" ></Test1>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {IpcChannel} from "@/ipc/ipc_channel";
import ipcRenderWrap from "@/ipc/ipc_render_wrap"
import Test1 from "@/views/Test1.vue";
const ejs = require('ejs');
const Store = require('electron-store');

const store = new Store();


export default defineComponent({
  name: 'Home',
  components: {
    Test1
    // HelloWorld,
    // Button
  },
  methods: {
    clickMe() {
      console.log('clickMe', this);
      store.set("abc", 346578697);
      console.log(store.get("abc"));
      store.set("a.b.c", 5);
      console.log(store.get("a"));


      ipcRenderWrap.send(IpcChannel.getTplContent, (event, args) => {
        console.log('send 22222222222222');
      }, 'xxxx')
    },
  }
});
</script>
