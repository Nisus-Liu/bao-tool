import {BrowserWindow, ipcMain} from "electron";
import fs from "fs";
import {IpcChannel} from "@/ipc/ipc_channel";




const ipcMainHandler = {
  listen(win: BrowserWindow) {
    ipcMain.on(IpcChannel.getTplContent, (event, args) => {
      console.log("收到渲染进程的消息", args);
      // 调用的地方算路径
      fs.readFile('./src/db/template/javabean.ejs', 'utf8' , (err, data) => {
        if (err) {
          console.error(err)
          return
        }
        win.webContents.send(IpcChannel.getTplContent, data); // 响应渲染进程
      })
    });
  },
}

export default ipcMainHandler;