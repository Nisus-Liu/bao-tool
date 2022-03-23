<template>
  <a-card :bordered="false">
    <a-tabs v-model:activeKey="activeKey" :tab-position="tabPosition">
      <a-tab-pane key="1" tab="配置">
        <a-form :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-form-item label="json">
            <a-input v-model:value="formState.json" />
          </a-form-item>
          <a-form-item label="模板">
            <a-textarea v-model:value="formState.tpl"></a-textarea>
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
            <a-button type="primary" @click="onSubmit">确定</a-button>
            <!--<a-button style="margin-left: 10px">Cancel</a-button>-->
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="2" tab="预览">
        <a-textarea v-model:value="result"></a-textarea>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script lang="ts">
import {defineComponent, reactive, ref, toRaw} from 'vue';
import ipcRenderWrap from "@/ipc/ipc_render_wrap";
import {IpcChannel} from "@/ipc/ipc_channel";
import {ipcRenderer} from "electron";

export default defineComponent({
  setup() {
    const activeKey = ref('1');
    const tabPosition = ref('right');
    const result = ref('');
    const formState = reactive({
      json: '{"a": 123, "b": true}',
      tpl: '',
    });

    // 拿到默认 template
    ipcRenderWrap.send(IpcChannel.getTplContent, (e, a) => {
      formState.tpl = a;
    });

    const onSubmit = () => {
      console.log('submit!', toRaw(formState));
      result.value = JSON.stringify(toRaw(formState));
    };
    return {
      activeKey,
      tabPosition,
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      formState,
      onSubmit,
      result,
    };
  },
});
</script>

<style scoped>

</style>