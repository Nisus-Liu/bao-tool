<template>
  <a-layout style="min-height: 100vh">
    <a-layout-header v-model:collapsed="collapsed" collapsible>
      <div class="logo" >
        <span>BAO</span>
      </div>
      <a-menu theme="dark" v-model:selectedKeys="selectedKeys" mode="horizontal">
        <a-menu-item key="home">
          <router-link to="/home">Home</router-link>
        </a-menu-item>
        <a-sub-menu key="java2struct">
          <!--<pie-chart-outlined />-->
          <template #title>From JSON</template>
          <a-menu-item key="json2javabean">
            <router-link to="/json2javabean">To JavaBean</router-link>
          </a-menu-item>
          <a-menu-item key="json2jsonschema">
            <router-link to="/json2jsonschema">To JsonSchema</router-link>
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item key="about">
          <!--<desktop-outlined />-->
          <router-link to="/about">About</router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout>
      <!--<a-layout-header style="background: #fff; padding: 0" />-->
      <a-layout-content style="margin: 16px 16px">
        <router-view/>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts">
import {ref} from 'vue';
export default {
  name: "BasicLayout",
  data() {
    return {
      collapsed: ref<boolean>(false),
      selectedKeys: ref<string[]>(['home']),
    };
  },
}
</script>

<style lang="scss" scoped>
.logo {
  float: left;
  width: 120px;
  height: 32px;
  line-height: 32px;
  margin: 16px 24px 16px 0;
  /*background: rgba(255, 255, 255, 0.3);*/
  background: url("../assets/icon/bao-tool-icon-shuanger.png") center center no-repeat;
  background-size: 100%;
  span {
    color: #e1e1e1;
    font-weight: bold;
  }
}

.site-layout .site-layout-background {
  background: #fff;
}
[data-theme='dark'] .site-layout .site-layout-background {
  background: #141414;
}
</style>