/**
 * 不重复注册 listener 回调;
 * 让发送事件和监听事件回调放在一起, 方便使用.
 */

import {IpcChannel} from "@/ipc/ipc_channel";
import {IpcRendererEvent} from "electron";

type IpcRendererEventListener = (event: IpcRendererEvent, ...args: any[]) => void;
const { ipcRenderer } = require("electron");


class IpcRenderWrap {
  send(ipcChannel: IpcChannel, listener: IpcRendererEventListener, ...args: any[]) {
    ipcRenderer.send(ipcChannel, ...args);
    ipcRenderer.once(ipcChannel, listener);
  }
}

const ipcRenderWrap = new IpcRenderWrap();
export default ipcRenderWrap;