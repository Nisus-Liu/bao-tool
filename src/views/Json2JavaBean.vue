<template>
  <a-card :bordered="false">
    <a-tabs v-model:activeKey="activeKey" :tab-position="tabPosition" @change="onTabChange">
      <a-tab-pane key="1" tab="配置">
        <a-form :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-form-item label="JSON">
            <Codemirror ref="cm1Ref" v-model:value="formState.json" :options="cmOptions" :height="400" border @change="onJsonChange" />
          </a-form-item>
          <!--<template v-if="toggleSearchStatus">
            <a-form-item label="模板">
              <Codemirror v-model:value="formState.tpl" :options="cmOptions" :height="200" border />
            </a-form-item>
          </template>-->
          <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
            <!--<a @click="handleToggleSearch" style="margin-right: 8px">
              {{ toggleSearchStatus ? '收起' : '展开' }}
              &lt;!&ndash;<a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>&ndash;&gt;
              <DownOutlined v-if="toggleSearchStatus"/><UpOutlined v-else />
            </a>-->
            <a-button type="primary" @click="onSubmit">确定</a-button>
            <!--<a-button style="margin-left: 10px">Cancel</a-button>-->
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="2" tab="预览">
        <Codemirror v-model:value="result" :options="cmOptions" :height="800" border />
      </a-tab-pane>
    </a-tabs>
    <div style="color: orangered">{{ parseError }}</div>
    <!--<Codemirror
        v-model:value="code"
        :options="cmOptions"
        border
        placeholder="test placeholder"
        :height="200"
        @change="onCodeChange"
    />-->
  </a-card>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, ref, toRaw} from 'vue';
import ipcRenderWrap from "@/ipc/ipc_render_wrap";
import {IpcChannel} from "@/ipc/ipc_channel";
import JsonParser, {ParseContext} from "@/util/json";
import {json2JavaBean} from "@/util/render";
import {
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons-vue';
import Codemirror from "codemirror-editor-vue3";
// import type { EditorConfiguration } from "codemirror";
// language
import "codemirror/mode/javascript/javascript.js";
// theme
import "codemirror/theme/eclipse.css";
import "codemirror/addon/hint/show-hint.css"
import "codemirror/addon/hint/show-hint.js"
import "codemirror/addon/hint/anyword-hint.js"
import "codemirror/addon/edit/matchbrackets.js"
import "codemirror/addon/edit/closebrackets.js"
import {DemoJson1, Test1} from "@/db/demodata";
import CodeMirror from 'codemirror';

const AT_KEYWORDS = [
  "required",
  "className",
  "minLength", "maxLength",
  "minimum", "maximum",
]

export default defineComponent({
  components: {
    Codemirror,
  },
  setup() {
    const activeKey = ref('1');
    const tabPosition = ref('right');
    const result = ref('');
    const formState = reactive({
      // json: DemoJson1,
      json: Test1,
      tpl: '',
    });

    // 拿到默认 template
    ipcRenderWrap.send(IpcChannel.getTplContent, (e, a) => {
      formState.tpl = a;
    });

    const parseError = ref(undefined);

    function getResult() {
      const parser = new JsonParser(formState.json);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      let context: ParseContext = undefined;
      try {
        context = parser.parse();
      } catch (e) {
        parseError.value = e.message;
        // activeKey 强行置回到 1
        activeKey.value = '1';
        throw e;
      }
      console.log("----> context: ", context)
      // result.value = ejs.render(formState.tpl, {context});
      result.value = json2JavaBean(context);
    }

    function onTabChange(currKey) {
      if (currKey == '2') {
        getResult();
      }
    }

    const onSubmit = () => {
      console.log('submit!', toRaw(formState));
      getResult();
      activeKey.value = '2';
    };

    const cm1Ref = ref();
    function getHints (cm, option) {
      return new Promise((accept) => {
        setTimeout(() => {
          let list: Array<any> = [];
          // let atKwRe = /@\w*/;
          let cursor = cm.getCursor(), curLine = cm.getLine(cursor.line)
          let start = cursor.ch, end = cursor.ch
          const lastAtIx = curLine.lastIndexOf('@');
          if (lastAtIx >= 0) {
            const pre = curLine.substring(lastAtIx +1);
            if (pre) {
              list = AT_KEYWORDS
                  .filter(it => it.startsWith(pre))
                  .map(it => it.substr(pre.length));
            } else {
              list = AT_KEYWORDS;
            }
          }

          return accept({list: list,
            from: CodeMirror.Pos(cursor.line, start),
            to: CodeMirror.Pos(cursor.line, end)})
        }, 100)

      })
    }

    const cmOptions = {
      tabSize: 4,
      // mode: 'text/javascript',  // 模式
      mode: "application/json",
      theme: "eclipse", // Theme, import 对应的 css 才能生效
      lineNumbers: true,  // 是否显示行数
      line: true,
      // viewportMargin: Infinity,  // 处理高度自适应时搭配使用
      highlightDifferences: true,
      autofocus: false,
      indentUnit: 2,
      // smartIndent: true,
      // readOnly: true,  // 只读
      showCursorWhenSelecting: true,
      firstLineNumber: 1,
      foldGutter: true, // Code folding
      styleActiveLine: true, // Display the style of the selected row
      matchBrackets: true, // 括号匹配高亮
      autoCloseBrackets: true, // 括号自动补全
      // 更多配置查询 https://codemirror.net/doc/manual.html#config
      // ^^代码提示配置
      // showHint: true, // 貌似不需要
      hintOptions: {
        completeSingle: false,
        alignWithWord: false,
        hint: getHints,
      }
      // $$代码提示配置
    };

    onMounted(() => {
      // cminstance 拿到原始 cm 对象
      let editor = cm1Ref.value.cminstance;
      console.log("---------onMounted-----", editor);
      // //代码自动提示功能，记住使用cursorActivity事件不要使用change事件，这是一个坑，那样页面直接会卡死
      editor.on('inputRead', function () {
        editor.showHint()
      })
    })

    const onJsonChange = (evt) => {
      // console.log('onJsonChange', evt);
      // 每次修改, 都假设正确了, 将上次的 error 清空
      parseError.value = undefined;
    }

    // -- 表单选项 展开-收起 --
    const toggleSearchStatus = ref(false);

    function handleToggleSearch() {
      toggleSearchStatus.value = !toggleSearchStatus.value;
    }

    return {
      activeKey,
      tabPosition,
      labelCol: {span: 4},
      wrapperCol: {span: 20},
      formState,
      result,
      parseError,
      onSubmit,
      onTabChange,
      cmOptions,
      onJsonChange,
      toggleSearchStatus,
      handleToggleSearch,
      cm1Ref,
    };
  },
});
</script>

<style scoped>

</style>