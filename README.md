# vue3-electron
[![Package Test](https://github.com/nofacer/vue3-electron/actions/workflows/package-test.yml/badge.svg)](https://github.com/nofacer/vue3-electron/actions/workflows/package-test.yml)
[![CodeQL](https://github.com/nofacer/vue3-electron/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/nofacer/vue3-electron/actions/workflows/codeql-analysis.yml)

Combine Vue3(beta) with Electron

What used:
* Vue3
* Electron
* Webpack
* Scss

```
yarn global add @vue/cli
vue create bao-tool
// 接下来, 用 Vue cli Electron plugin 集成 electron
vue add electron-builder
```


Tutorial:
[Vue3+Electron整合方式](https://zhuanlan.zhihu.com/p/181015456)



```
// 编译 vue
npm run build
// 启动 electron
npm run start
```

[EJS -- 嵌入式 JavaScript 模板引擎 | EJS 中文文档](https://ejs.bootcss.com/)


## FAQ

- Vue cli Electron plugin

    https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/#installation
    
    ```
    vue add electron-builder
    ```

- vue-router.esm-bundler.js?6c02:3302 ReferenceError: __dirname is not defined
  at eval (webpack-internal:///./node_modules/electron/index.js:4)

    [vue.js - How fix __dirname not defined when using electron events with Vue? - Stack Overflow](https://stackoverflow.com/questions/62777834/how-fix-dirname-not-defined-when-using-electron-events-with-vue)
    To solve this I created a file vue.config.js in project root with content
    ```js
    module.exports = {
      pluginOptions: {
        electronBuilder: {
          nodeIntegration: true
        }
      }
    }
    ```