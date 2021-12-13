const
    SPACE = ' ',
    TAB = '\t',
    LF = '\n',
    CR = '\r'
;

class Asserts {
  static nonNull(obj: any, msg: string = 'nonNull') {
    if (obj == null) {
      throw new Error(msg);
    }
  }
}

class JsonObject {
  fields: JsonField[] = [];
}

class JsonArray {

}

type ValueType = string | number | JsonObject | JsonArray

class JsonField {
  // 所在的 JsonObject
  parent: JsonObject;
  key: null | string = null;
  value: null | string = null;
  valueType: ValueType | undefined;
  comment: string = '';

  constructor(parent: JsonObject) {
    this.parent = parent;
  }
}

class Lexer {
  inputPtr: number = 0
  inputBuffer: string
  inputEnd: number
  textBuffer: Text
  currInputRow: number = 0;
  currInputRowStart: number = 0;

  constructor(inputBuffer: string) {
    this.inputBuffer = inputBuffer;
    this.inputEnd = inputBuffer.length;
    this.textBuffer = new Text(inputBuffer);
  }

  skipWsOrEnd() {
    let i: string;
    while (this.inputPtr < this.inputEnd) {
      i = this.inputBuffer.charAt(this.inputPtr++);
      if (i > SPACE) {
        return i;
      }
      // <= INT_SPACE
      this.handleBlank(i);
    }

    return -1;
  }

  // 空格, \n, \r, \t
  handleBlank(i: string) {
    if (i > SPACE) {
      return this.inputPtr;
    }
    if (i != SPACE) {
      if (i == LF) {
        ++this.currInputRow;
        this.currInputRowStart = this.inputPtr;
      } else if (i == CR) {
        this.skipCR();
      } else if (i != TAB) {
        this.throwInvalidSpace(i);
      }
    }
    return this.inputPtr;
  }


  skipCR() {
    // \r 忽略
    if (this.inputPtr < this.inputEnd) {
      // ++_currInputRow;
      this.currInputRowStart = ++this.inputPtr;
    }
  }

  throwInvalidSpace(c: string) {
    // String msg = "Illegal character ("+_getCharDesc(c)+"): only regular white space (\\r, \\n, \\t) is allowed between tokens";
    let msg = "非法空白符: '" + c + "', 仅支持: (\\r, \\n, \\t)";
    this.reportError(msg);
  }

  reportError(msg: string) {
    let loc = this.getCurrentLocation();
    let err = msg + ": (" + loc[0] + "," + loc[1] + ")";
    throw new Error(msg)
  }

  getCurrentLocation() {
    let col = this.inputPtr - this.currInputRowStart + 1; // 1-based
    return [this.currInputRow, col - 1];
  }
}

/**
 * 包含长字符串，设置位置，获取子串。
 */
class Text {
  private value: string;
  private pos: number;
  private start = 0;
  private len = 0;

  constructor(src: string, start = 0, len = 0) {
    this.value = src || '';
    this.pos = 0;
    this.start = start;
    this.len = len;
  }

  get() {
    return this.value.substr(this.pos);
  }

  reset(start: number, len: number) {
    this.start = start;
    this.len = len;
  }

  advance(len = 1) {
    let oldPos = this.pos;
    this.pos += len;
    return this.value.substr(oldPos, len);
  }

  // 正则匹配开头部分, 自动位移被匹配的长度
  lex(reg: RegExp) {
    let exec = reg.exec(this.value.substr(this.pos));
    if (exec) {
      this.pos += exec[0].length;
      return exec;
    }
    return null;
  }

  // 剔除空白符, 空白行
  trimBlank() {
    this.lex(/\s*/)
  }

  lookAhead(len: number = 1) {
    return this.value.substr(this.pos, len);
  }

  // pos 后退
  back(len: number) {
    let s = this.lookBack(len);
    this.pos -= s.length;
    return s;
  }

  lookBack(len: number) {
    let from = this.pos - len;
    return from >= 0 ? this.value.substr(from, len) : '';
  }

  isEmpty() {
    return this.value.length == 0 || this.pos >= this.value.length;
  }

  getPos() {
    return this.pos;
  }

}

const Ctx: any = {}

enum State {
  start = 'start',
  object_start = 'object_start',
  object_end = 'object_end',
}

const states = {

  start: (buff: Text, ctx: any) => {
    let c = buff.advance();
    ctx.from = 'start';
    if (c == '{') {
      return states.object_start;
    } else if (c == "[") {
      return states.array_start;
    }
  },
  end: (buff: Text, ctx: any) => {
    return ctx;
  },
  object_start: (buff: Text, ctx: any) => {
    buff.trimBlank();
    return states.field_start;
  },
  object_end: (buff: Text, ctx: any) => {
    buff.trimBlank();
    let s = buff.lookAhead();
    if (s == ',') {
      buff.trimBlank();
    }

    return states.end(buff, ctx);
  },
  array_start: (buff: Text, ctx: any) => {

  },
  array_end: (buff: Text, ctx: any) => {

  },
  field_start: (buff: Text, ctx: any) => {
    let s = buff.lookAhead(2);
    let jsonField = new JsonField(ctx.current as JsonObject);
    ctx.fields.append(jsonField);
    ctx.current = jsonField;
    if (s == '//' || s == '/*') {
      return states.block_comment;
    }
    return states.field_name;
  },
  field_name: (buff: Text, ctx: any) => {
    // <key>:
    let exec = buff.lex(/'(.*)'\s*:|"(.*)"\s*:|(.*)\s*:/);
    if (exec == null) {
      throw new Error("json filed hasn't key: " + buff.getPos());
    }
    let key = exec[1] || exec[2] || exec[3];
    (ctx.current as JsonField).key = key;
    buff.trimBlank();
    states.field_value(buff, ctx);
  },
  field_value: (buff: Text, ctx: any) => {
    let exec = buff.lex(/(".*")|('.*')|(\w+)/);
    let val = exec && (exec[1] || exec[2] || exec[3]);
    (ctx.current as JsonField).value = val;

    buff.trimBlank();
    let s = buff.lookAhead();
    if (s == ",") {
      buff.trimBlank();
      s = buff.lookAhead()
    }
    if (s == '}') {
      ctx.current = (ctx.current as JsonField).parent;
      return states.object_end;
    } else if (s == '/' && buff.lookAhead() == '/') {
      // 行内注释
      ctx.from = 'value';
      return states.tail_comment;
    }

  },
  block_comment: (buff: Text, ctx: any) => {
    let s = buff.lookAhead(2);
    let cmt = '';
    if (s == '//') {
      let exec = buff.lex(/\/\/\s*(.*)\n/);
      Asserts.nonNull(exec, "行注释必须跟随 \\n, 否则后面没有非空内容, 正常闭合: " + buff.getPos());
      cmt += exec?.[1];
    } else if (s == '/*') {
      let exec = buff.lex(/\/\*\**([\s\S]*)\*\//);
      Asserts.nonNull(exec);
      // @ts-ignore
      let allCmt = exec[1];
      cmt += allCmt.replaceAll(/\n\s*\*/g, '\n');
    }

    (ctx.current as JsonField).comment += cmt;

    return states.field_name;
  },
  // 行尾注释
  // 行尾注释会和块注释合并.
  tail_comment: (buff: Text, ctx: any) => {
    let exec = buff.lex(/\/\/\s*(.*)\n/);
    Asserts.nonNull(exec, "行注释必须跟随 \\n, 否则后面没有非空内容, 正常闭合: " + buff.getPos());
    let cmt = exec && exec[1];
    let oldCmt = (ctx.current as JsonField).comment;
    (ctx.current as JsonField).comment += oldCmt ? '\n' + cmt : cmt;

    buff.trimBlank();
    let s = buff.lookAhead();
    if (s == '}') {
      ctx.current = (ctx.current as JsonField).parent;
      return states.object_end;
    }
    // 下一个兄弟 filed
    ctx.current = (ctx.current as JsonField).parent; // json object
    return states.field_start;
  },


}


let ss = "{\n" +
    "\"a\": 1,\n" +
    "\"b\": \"xx\"\n" +
    "}"

const buff = new Text(ss);
states.start(buff, Ctx);
console.log(Ctx)