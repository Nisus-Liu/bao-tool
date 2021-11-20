<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo" >
        BAO
      </div>
      <a-menu theme="dark" v-model:selectedKeys="selectedKeys" mode="inline">
        <a-menu-item key="home">
          <router-link to="/home">Home</router-link>
        </a-menu-item>
        <a-sub-menu key="java2struct">
          <!--<pie-chart-outlined />-->
          <template #title>JSON转Struct</template>
          <a-menu-item key="json2javabean">
            <router-link to="/json2javabean">JSON->JavaBean</router-link>
          </a-menu-item>
          <a-menu-item>
            <span>TODO</span>
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item key="about">
          <!--<desktop-outlined />-->
          <router-link to="/about">About</router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0" />
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

<style scoped>
.logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
}

.site-layout .site-layout-background {
  background: #fff;
}
[data-theme='dark'] .site-layout .site-layout-background {
  background: #141414;
}
</style>