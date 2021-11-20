<template>
  <a-card :bordered="false">
    <a-tabs v-model:activeKey="activeKey" :tab-position="tabPosition">
      <a-tab-pane key="1" tab="配置">
        <a-form :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-form-item label="Activity name">
            <a-input v-model:value="formState.name" />
          </a-form-item>
          <a-form-item label="Activity zone">
            <a-select v-model:value="formState.region" placeholder="please select your zone">
              <a-select-option value="shanghai">Zone one</a-select-option>
              <a-select-option value="beijing">Zone two</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Activity time">
            <a-date-picker
                v-model:value="formState.date1"
                show-time
                type="date"
                placeholder="Pick a date"
                style="width: 100%"
            />
          </a-form-item>
          <a-form-item label="Instant delivery">
            <a-switch v-model:checked="formState.delivery" />
          </a-form-item>
          <a-form-item label="Activity type">
            <a-checkbox-group v-model:value="formState.type">
              <a-checkbox value="1" name="type">Online</a-checkbox>
              <a-checkbox value="2" name="type">Promotion</a-checkbox>
              <a-checkbox value="3" name="type">Offline</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item label="Resources">
            <a-radio-group v-model:value="formState.resource">
              <a-radio value="1">Sponsor</a-radio>
              <a-radio value="2">Venue</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="Activity form">
            <a-input v-model:value="formState.desc" type="textarea" />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
            <a-button type="primary" @click="onSubmit">Create</a-button>
            <a-button style="margin-left: 10px">Cancel</a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="2" tab="预览">
        预览
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script lang="ts">
import { defineComponent, reactive, toRaw, ref } from 'vue';
export default defineComponent({
  setup() {
    const activeKey = ref('1');
    const tabPosition = ref('right');
    const formState = reactive({
      name: '',
      region: undefined,
      date1: undefined,
      delivery: false,
      type: [],
      resource: '',
      desc: '',
    });
    const onSubmit = () => {
      console.log('submit!', toRaw(formState));
    };
    return {
      activeKey,
      tabPosition,
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      formState,
      onSubmit,
    };
  },
});
</script>

<style scoped>

</style>