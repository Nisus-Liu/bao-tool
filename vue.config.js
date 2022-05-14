module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? './' : './',
  pluginOptions: {
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