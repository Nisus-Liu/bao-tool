

class CharTypes {
  static LATIN1 = (() => {
    console.log('CharTypes 执行....')
    /* 96 would do for most cases (backslash is ASCII 94)
         * but if we want to do lookups by raw bytes it's better
         * to have full table
         */
    const table = [];
    // Control chars and non-space white space are not allowed unquoted
    for (let i = 0; i < 32; ++i) {
      table[i] = -1;
    }
    // And then string end and quote markers are special too
    table['"'.charCodeAt(0)] = 1;
    table['\\'.charCodeAt(0)] = 1;
    // sInputCodes = table;
    return table;
  })

}

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

class Token {
  // 描述
  desc: string;
  constructor(serialized: string) {
    this.desc = serialized;
  }
}

enum Tokens {
  // {
  OBJECT_START = new Token('{'),
  // }
  OBJECT_END = new Token('}'),
  // [
  ARRAY_START = new Token('['),
  // ]
  ARRAY_END = new Token(']'),
  // "
  DBQ = new Token('"'),
  // '
  SQ = new Token("'"),
  // :
  KV_SEP = new Token(":"),
  BLOCK_CMT = new Token("/*...*/"),
  LINE_CMT = new Token("//..."),
  YAML_LINE_CMT = new Token("#..."),
  ELE_SEP = new Token(','),
}

class JsonReadContext {
  static TYPE_ROOT = 0;
  static TYPE_OBJECT = 1;
  static TYPE_ARRAY = 2;
  parent: JsonReadContext;
  child: JsonReadContext;
  type: number;

  constructor(parent: JsonReadContext, type: number) {
    this.parent = parent;
    this.type = type;
    if (parent != null) {
      parent.child = this;
    }
  }

  static createRootContext() {
    // @ts-ignore
    return new JsonReadContext(null, JsonReadContext.TYPE_ROOT);
  }

  createObjectContext() {
    return new JsonReadContext(this, JsonReadContext.TYPE_OBJECT);
  }

  createArrayContext() {
    return new JsonReadContext(this, JsonReadContext.TYPE_ARRAY);
  }

  inObject() {
    return this.type === JsonReadContext.TYPE_OBJECT;
  }

  inArray() {
    return this.type === JsonReadContext.TYPE_ARRAY;
  }

  isRoot() {
    return this.type === JsonReadContext.TYPE_ROOT;
  }
}

class Lexer {
  inputPtr: number = 0
  inputBuffer: string
  inputEnd: number
  textBuffer: Text
  currInputRow: number = 0;
  currInputRowStart: number = 0;
  closed: boolean = false;
  lastToken: Token|null = null;
  currToken: Token|null = null;
  ctx: JsonReadContext;

  constructor(inputBuffer: string) {
    this.inputBuffer = inputBuffer;
    this.inputEnd = inputBuffer.length;
    this.textBuffer = new Text(inputBuffer);
    this.ctx = JsonReadContext.createRootContext();
  }

  nextToken() {
    let i = this.skipWsOrEnd();
    // EOF
    if (i < 0) {
      // 关闭
      this.close();
      return (this.currToken = null);
    }

    this.lastToken = this.currToken;
    this.currToken = null;
    let t;
    switch (i) {
      case '{':
        t = Tokens.OBJECT_START;
        this.ctx = this.ctx.createObjectContext();
        break;
      case '}':
        if (!this.ctx.inObject()) {
          this.reportError("'{'和'}'不配对");
        }
        t = Tokens.OBJECT_END;
        this.ctx = this.ctx.parent;
        break;
      case '[':
        t = Tokens.ARRAY_START;
        this.ctx = this.ctx.createArrayContext();
        break;
      case ']':
        if (!this.ctx.inArray()) {
          this.reportError("'['和']'不配对");
        }
        t = Tokens.ARRAY_END;
        this.ctx = this.ctx.parent;
        break;
      case ':':
        t = Tokens.KV_SEP;
        break;
      case '/':
        t = Tokens.LINE_CMT;
        break;
      case '#':
        t = Tokens.YAML_LINE_CMT;
        break;
      case '*':
      case ',':

      default:

        break;
    }

    this.currToken = t;
    return t;
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

  close() {
    if (!this.closed) {
      // 19-Jan-2018, tatu: as per [core#440] need to ensure no more data assumed available
      this.inputPtr = Math.max(this.inputPtr, this.inputEnd);
      this.closed = true;

      // 释放 buff 引用
      this.inputBuffer = '';
    }
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

  // advance(len = 1) {
  //   let oldPos = this.pos;
  //   this.pos += len;
  //   return this.value.substr(oldPos, len);
  // }
  //
  // // 正则匹配开头部分, 自动位移被匹配的长度
  // lex(reg: RegExp) {
  //   let exec = reg.exec(this.value.substr(this.pos));
  //   if (exec) {
  //     this.pos += exec[0].length;
  //     return exec;
  //   }
  //   return null;
  // }
  //
  // // 剔除空白符, 空白行
  // trimBlank() {
  //   this.lex(/\s*/)
  // }
  //
  // lookAhead(len: number = 1) {
  //   return this.value.substr(this.pos, len);
  // }
  //
  // // pos 后退
  // back(len: number) {
  //   let s = this.lookBack(len);
  //   this.pos -= s.length;
  //   return s;
  // }
  //
  // lookBack(len: number) {
  //   let from = this.pos - len;
  //   return from >= 0 ? this.value.substr(from, len) : '';
  // }
  //
  // isEmpty() {
  //   return this.value.length == 0 || this.pos >= this.value.length;
  // }
  //
  // getPos() {
  //   return this.pos;
  // }

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
    const exec = buff.lex(/\/\/\s*(.*)\n/);
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


// ----------------------
console.log(CharTypes.LATIN1);
console.log(CharTypes.LATIN1);
console.log(CharTypes.LATIN1);

let ss = "{\n" +
    "\"a\": 1,\n" +
    "\"b\": \"xx\"\n" +
    "}"

// const buff = new Text(ss);
// states.start(buff, Ctx);
// console.log(Ctx)