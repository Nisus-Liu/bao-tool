

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


