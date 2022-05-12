/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
  "appId": "com.nisus.baotool",
  "productName": "BaoTool",
  "copyright": "Copyright © 2022 ${author}",
  "win": {
    "target": "nsis",
    "icon": "src/assets/icon/icon.ico"
  },
  "mac": {
    "icon": "src/assets/icon/icon.icns"
  },
  "rpm": {
    "category": "Other"
  },
  "extraFiles": [
    {
      "from": "public/",
      "to": "resources"
    }
  ],
  // publish: {
  //   provider: 'gittee',
  //   repo: 'bao-tool', // git仓库
  //   owner: 'Nisus-Liu', // 拥有者
  //   releaseType: 'release',
  //   vPrefixedTagName: false,
  //   publishAutoUpdate: true // 发布自动更新（需要配置GH_TOKEN）。 默认true
  // }
}
