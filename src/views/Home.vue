<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <!--<HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/>-->
    <AButton type="primary" v-on:click="clickMe">点我</AButton>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
// import { ipcRenderer } from 'electron';
const ejs = require('ejs');

const { ipcRenderer } = require("electron");
ipcRenderer.on('getTplContent', (event, args)=>{
  console.log('接收到主进程的消息', args)
  const list = ["张三", "李逵", "李鬼"];
  let res = ejs.render(args, {list});
  console.log(res);
})

export default defineComponent({
  name: 'Home',
  components: {
    // HelloWorld,
    // Button
  },
  methods: {
    clickMe() {
      console.log('clickMe', this);

      ipcRenderer.send("getTplContent");
    },
  }
});
</script>
