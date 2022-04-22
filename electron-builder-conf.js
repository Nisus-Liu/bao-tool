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
  ]
}
