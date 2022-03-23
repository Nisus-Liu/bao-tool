<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <!--<HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/>-->
    <AButton type="primary" v-on:click="clickMe">点我</AButton>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {IpcChannel} from "@/ipc/ipc_channel";
import ipcRenderWrap from "@/ipc/ipc_render_wrap"
const ejs = require('ejs');

// const { ipcRenderer } = require("electron");
// ipcRenderer.once('getTplContent', (event, args)=>{
//   console.log('接收到主进程的消息', args)
//   const list = ["张三", "李逵", "李鬼"];
//   let res = ejs.render(args, {list});
//   console.log(res);
// })
ipcRenderWrap.send(IpcChannel.getTplContent, (event, args) => {
  console.log('send 111111111111111qq');
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

      // ipcRenderer.send("getTplContent");
      // ipcRenderer.once('getTplContent', (event, args)=>{
      //   console.log('接收到主进程的消息22222', args)
      // })
      ipcRenderWrap.send(IpcChannel.getTplContent, (event, args) => {
        console.log('send 22222222222222');
      }, 'xxxx')
    },
  }
});
</script>
