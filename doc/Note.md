
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

* Vue cli Electron plugin

  https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/#installation

    ```
    vue add electron-builder
    ```

* vue-router.esm-bundler.js?6c02:3302 ReferenceError: __dirname is not defined
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

* Do not use "@ts-ignore" because it alters compilation errors  @typescript-eslint/ban-ts-comment

```
'@typescript-eslint/ban-ts-ignore': 'off',
'@typescript-eslint/ban-ts-comment': 'off',
```


* 存储方案
  [sindresorhus/electron-store: Simple data persistence for your Electron app or module - Save and load user preferences, app state, cache, etc](https://github.com/sindresorhus/electron-store)
  [Electron存储简单数据和用户首选项推荐用electron-store](https://xushanxiang.com/electron-store.html)
  
* [Mock.js](http://mockjs.com/examples.html)

* ? 怎么更换图标?

使用 --config 指定配置后, package.json>main 需要改成 `"main": "dist_electron/bundled/background.js",`

[PNG转ICO图标格式 - 在线，免费，快速](https://png2icojs.com/zh/)

* Vue CLI Plugin Electron Builder

[Configuration | Vue CLI Plugin Electron Builder](https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/configuration.html#table-of-contents)
To see available options, check out Electron Builder Configuration Options([Common Configuration - electron-builder](https://www.electron.build/configuration/configuration))


*  ⨯ Get "https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-3.0.4.1/nsis-3.0.4.1.7z": read tcp 192.168.31.52:10154->140.82.114
   .3:443: wsarecv: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed becaus
   e connected host has failed to respond.

A: 手动下载放到目录下([打包成安装包错误，下载不来winCodeSign · Issue #26 · trazyn/weweChat · GitHub](https://github.com/trazyn/weweChat/issues/26))
![img.png](img.png)

* `codemirror-editor-vue3` 代码提示配置

1. options
```
hintOptions: {
    completeSingle: false,
    alignWithWord: false,
    hint: getHints, // 返回代码提示的结构. list,from,to
}
```
2. onMounted
```
onMounted(() => {
  // cminstance 拿到原始 cm 对象
  let editor = cm1Ref.value.cminstance;
  console.log("---------onMounted-----", editor);
  // //代码自动提示功能，记住使用cursorActivity事件不要使用change事件，这是一个坑，那样页面直接会卡死
  editor.on('inputRead', function () {
    editor.showHint()
  })
})
```

[(74条消息) 实现codemirror的自定义提示的功能_maya1024的博客-CSDN博客_codemirror代码提示](https://blog.csdn.net/high32/article/details/117049672)
[CodeMirror代码提示功能 - 掘金](https://juejin.cn/post/6844904013180174343)
[codeMirror_dome/HelloWorld.vue at master · mingju0421/codeMirror_dome · GitHub](https://github.com/mingju0421/codeMirror_dome/blob/master/src/components/HelloWorld.vue)



-  Please move 'build' into the development package.json 

  [Electron Vue 打包错误： InvalidConfigurationError: ‘build‘ in the application package.json_luxiu-yuruyan的博客-CSDN博客](https://blog.csdn.net/KYuruyan/article/details/119948460)

- package.json script rm cp ... 命令跨环境

  [npm script 跨端兼容的实现 - 掘金](https://juejin.cn/post/6844903860864188430)

  `yarn add make-dir-cli rimraf cpr cross-var -D ` 

* [Error: Cannot cleanup http error:401 unauthorized · Issue #3237 · electron-userland/electron-builder](https://github.com/electron-userland/electron-builder/issues/3237)
  ```
  A recent scan found a valid OAuth, GitHub App or personal access token linked to your GitHub account in the content of this commit to Nisus-Liu/bao-tool. 
  We have revoked the key to protect your data from unauthorized access, and as a consequence, any app using this token won’t be able to authenticate to GitHub.
  ```
  原来是, github 发现 commit 中有明文 gh token, 就自动 revoke (废除) 了.

## 发布

供下载使用.

[electron 应用打包后自动发布至 GitHub Releases · Tit1e](http://evolly.one/p/20107.html)

[通过electron-builder构建electron应用发布git release - 本人的窝](https://www.1zilc.top/javascript/%E9%80%9A%E8%BF%87electron-builder%E6%9E%84%E5%BB%BAelectron%E5%BA%94%E7%94%A8%E5%8F%91%E5%B8%83git-release/1zilc/)

[使用 CI 构建和发布 electron 应用](https://blog.sigoden.com/build-and-publish-electron-app-with-ci/) (应该不错 Travis Linux|Mac; AppVeyor window)

[记录一次electron开发和持续集成 - 简书](https://www.jianshu.com/p/add047a84e85) (access_token)

[Electron-快速构建安装包及自动发布 - 掘金](https://juejin.cn/post/6844904102011338766#heading-4)


### 配置

https://www.electron.build/configuration/publish#how-to-publish

| Value          | Description                            |
| :------------- | :------------------------------------- |
| `onTag`        | on tag push only                       |
| `onTagOrDraft` | on tag push or if draft release exists |
| `always`       | always publish                         |
| `never`        | never publish                          |

### GH_TOKEN


*!! CI 工具需要在 AppVeyor 等平台上操作.* 

#### Appveyor

https://ci.appveyor.com/project/Nisus-Liu/bao-tool

1. 关联目标仓库.
2. 项目代码中配置 `appveyor.yml`.
3. push 触发 CI/CD

```
HttpError: 401 Unauthorized
"method: GET url: https://api.github.com/repos/Nisus-Liu/bao-tool/releases\n\n          Data:\n          {\"message\":\"Bad credentials\",\"documentation_url\":\"https://docs.github.com/rest\"}\n          "
Headers: {
...
```
[Error: Cannot cleanup http error:401 unauthorized · Issue #3237 · electron-userland/electron-builder](https://github.com/electron-userland/electron-builder/issues/3237)



### npm script 命令方式

[electron 应用打包后自动发布至 GitHub Releases · Tit1e](http://evolly.one/p/20107.html)

GH_TOKEN 环境变量

方式1:

```
cross-env GH_TOKEN=xxx
// or
// window
set GH_TOKEN=xxx (git token)
// Linux | mac
export GH_TOKEN=xxx
```

方式2:

```
"config": {
	"GH_TOKEN": "xxx"
},
```



- 配置方便
- 每个平台需要单独发布(繁琐些)



vue.config.js

```
pluginOptions.electronBuilder.builderOptions
```

package.json

```
"publish": "rimraf dist_electron && cross-env GH_TOKEN=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 vue-cli-service electron:build --publish always"
```






## github <-> gitee 同步
(手动同步)

```
git remote add github git@github.com:Nisus-Liu/bao-tool.git
git pull origin feature/v1 // 拉取 gittee 的最新分支代码 (本仓库 origin 是 gitee 别名)
git push github feature/v1
```
