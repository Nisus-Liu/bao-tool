module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? './' : './',
  pluginOptions: {
    publish: {
      provider: 'github',
      repo: 'bao-tool', // git仓库
      owner: 'Nisus-Liu', // 拥有者
      releaseType: 'release',
      vPrefixedTagName: true,
      publishAutoUpdate: true // 发布自动更新（需要配置GH_TOKEN）。 默认true
    },
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        // build配置在此处
        // options placed here will be merged with default configuration and passed to electron-builder
        "appId": "com.nisus.baotool",
        "productName": "BaoTool",
        "copyright": "Copyright © 2022 ${author}",
        "mac": {
          "category": "public.app-category.utilities"
        },
        "dmg": {
          "contents": [
            {
              "x": 110,
              "y": 150
            },
            {
              "x": 240,
              "y": 150,
              "type": "link",
              "path": "/Applications"
            }
          ]
        },
        "win": {
          "target": "nsis"
        },
        "linux": {
          "category": "Utility",
          "target": [
            "deb",
            "AppImage"
          ]
        }
      }
    }
  }
}