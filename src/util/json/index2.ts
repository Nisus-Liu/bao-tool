function char(str: string) {
  if (str == null) {
    return -1;
  }
  if (str.length > 1) {
    throw new Error("'str' must len 1");
  }
  return str.charCodeAt(0);
}

function str(i: number) {
  return String.fromCharCode(i);
}

class JsonToken {
  static NULL = new JsonToken("NULL");
  static LPAREN = new JsonToken("(");
  static RPAREN = new JsonToken(")");
  static LBRACE = new JsonToken("{");
  static RBRACE = new JsonToken("}");
  static LBRACKET = new JsonToken("[");
  static RBRACKET = new JsonToken("]");
  static COMMA = new JsonToken(",");
  static COLON = new JsonToken(":");
  static LITERAL_STRING = new JsonToken("s")
  static LITERAL_NUMBER = new JsonToken("n")

  name: string;

  constructor(name: string) {
    this.name = name;
  }
}


class JsonLexer {
  static EOI = 0x1A
  text = '';
  bp;
  // string pos ?
  sp;
  np;
  pos;
  len;
  ch = -1;
  _token: JsonToken;

  constructor(input: string) {
    this.text = input;
    this.len = input.length;
    this.bp = -1;

    this.next();
    if (this.ch == 65279) { // utf-8 bom
      this.next();
    }
  }

  token() {
    return this._token;
  }

  tokenName() {
    return this._token.name;
  }

  skipWhitespace() {
    for (; ;) {
      if (this.ch <= char('/')) {
        if (this.isWhitespace(this.ch)) {
          this.next();
          continue;
        } else if (this.ch == char('/')) {
          skipComment();
          continue;
        } else {
          break;
        }
      } else {
        break;
      }
    }
  }

  isWhitespace(ch: number) {
    return ch == char(' ') ||
        ch == char('\r') ||
        ch == char('\n') ||
        ch == char('\t') ||
        ch == char('\f') ||
        ch == char('\b');
  }

  nextToken() {

  }

  getCurrent() {
    return this.ch;
  }

  next(): number {
    const index = ++this.bp;
    return this.ch = (index >= this.len ? //
        JsonLexer.EOI //
        : this.text.charCodeAt(index));
  }

  scanSymbol(quote: string) {
    this.np = this.bp;
    this.sp = 0;
    let chLocal: number;

    const unQuoted = !quote;

    for (; ;) {
      chLocal = this.next();

      if (unQuoted) {
        if (this.isWhitespace(chLocal)) {
          break;
        }
      } else {
        if (chLocal == char(quote)) {
          break;
        }
      }

      if (chLocal == JsonLexer.EOI) {
        throw new Error("unclosed.str");
      }

      // 暂不考虑 '\' 转义

      this.sp++;
    }

    this._token = JsonToken.LITERAL_STRING;

    let value;
    let offset;
    if (this.np == -1) {
      offset = 0;
    } else {
      offset = this.np + 1;
    }

    value = this.text.substr(offset, this.sp);

    this.sp = 0;
    this.next();

    return value;
  }

  scanSymbolUnQuoted() {
    return this.scanSymbol("");
  }

  scanNumber() {

  }

  numberValue() {
    return 1.234;
  }

  scanString() {

  }

  stringValue() {
    return "todo"
  }

  info() {
    let buf = '';

    let line = 1;
    let column = 1;
    for (let i = 0; i < this.bp; ++i, column++) {
      const ch = this.text.charAt(i);
      if (ch == '\n') {
        column = 1;
        line++;
      }
    }

    buf += "pos " + this.bp +
        ", line " + line
        + ", column " + column;

    if (this.text.length < 65535) {
      buf += this.text;
    } else {
      buf += this.text.substring(0, 65535);
    }

    return buf;
  }

  resetStringPosition() {
    this.sp = 0;
  }
}

class JsonParser {
  input;
  lexer: JsonLexer;
  objectKeyLevel = 0;
  context: ParseContext | null = null;
  contextArray: ParseContext[] = [];

  constructor(input: string) {
    this.lexer = new JsonLexer(input);
    this.input = input;

    const ch = this.lexer.getCurrent();
    if (ch == char('{')) {
      this.lexer.next();
      this.lexer._token = JsonToken.LBRACE;
    } else if (ch == char('[')) {
      this.lexer.next();
      this.lexer._token = JsonToken.LBRACKET;
    } else {
      this.lexer.nextToken(); // prime the pump
    }
  }

  /**
   *
   * com.alibaba.fastjson.parser.DefaultJSONParser#parseObject(java.util.Map, java.lang.Object) (v1.2.73)
   * @param ctx
   * @param fieldName
   */
  parseObject(ctx: ParseContext, fieldName: string | null) {
    if (this.lexer.token() == JsonToken.NULL) {
      this.lexer.nextToken();
      return null;
    }

    if (this.lexer.token() == JsonToken.RBRACE) {
      this.lexer.nextToken();
      return ctx;
    }

    if (this.lexer.token() == JsonToken.LITERAL_STRING && this.lexer.stringValue().length == 0) {
      this.lexer.nextToken();
      return ctx;
    }
    // object , '{' 或 ','
    if (this.lexer.token() != JsonToken.LBRACE && this.lexer.token() != JsonToken.COMMA) {
      throw new Error("syntax error, expect {, actual " + this.lexer.tokenName() + ", " + this.lexer.info());
    }

    let setContextFlag = false;

    let context = this.context; // 当前 context

    for (; ;) {
      this.lexer.skipWhitespace();
      let ch = this.lexer.getCurrent();
      // 是否允许多余的 ','
      // if (lexer.isEnabled(Feature.AllowArbitraryCommas)) {
      while (ch == char(',')) {
        this.lexer.next();
        this.lexer.skipWhitespace();
        ch = this.lexer.getCurrent();
      }
      // }

      let isObjectKey = false;
      let key;
      if (ch == char('"')) {
        key = this.lexer.scanSymbol('"');
        this.lexer.skipWhitespace();
        ch = this.lexer.getCurrent();
        if (ch != char(':')) {
          throw new Error("expect ':' at " + this.lexer.pos() + ", name " + key);
        }
      } else if (ch == char('}')) {
        this.lexer.next();
        this.lexer.resetStringPosition();
        this.lexer.nextToken();

        if (!setContextFlag) {
          if (this.context != null /*&& fieldName == this.context.key && ctx == this.context.value*/) { // ? key一样, value一样, 什么场景会发生?
            context = this.context; // 不变
          } else {
            let contextR: ParseContext = new ParseContext(this.context);
            if (context == null) {
              context = contextR;
            }
            setContextFlag = true;
          }
        }

        return ctx;
      } else if (ch == char('\'')) {
        key = this.lexer.scanSymbol('\'');
        this.lexer.skipWhitespace();
        ch = this.lexer.getCurrent();
        if (ch != char(':')) {
          throw new Error("expect ':' at " + this.lexer.pos() + ", name " + key);
        }
      } else if (ch == JsonLexer.EOI) {
        throw new Error("syntax error");
      } else if (ch == char(',')) {
        throw new Error("syntax error");
      }
      // 数值型 key
      else if ((ch >= char('0') && ch <= char('9')) || ch == char('-')) {
        this.lexer.resetStringPosition();
        this.lexer.scanNumber();
        key = this.lexer.numberValue();
        ch = this.lexer.getCurrent();
        if (ch != char(':')) {
          throw new Error("parse number key error" + this.lexer.info());
        }
      }
          /*暂不考虑 objectKey 场景
          else if (ch == char('{') || ch == char('[')) {
            if (this.objectKeyLevel++ > 512) {
              throw new Error("object key level > 512");
            }
            this.lexer.nextToken();
            key = parse();
            isObjectKey = true;
          }*/
      // 无引号的 key?
      else {
        key = this.lexer.scanSymbolUnQuoted();
        this.lexer.skipWhitespace();
        ch = this.lexer.getCurrent();
        if (ch != char(':')) {
          throw new Error("expect ':' at " + this.lexer.pos() + ", actual " + ch);
        }
      }

      if (!isObjectKey) {
        this.lexer.next();
        this.lexer.skipWhitespace();
      }

      ch = this.lexer.getCurrent();
      this.lexer.resetStringPosition();

      if (!setContextFlag) {
        if (this.context != null /*&& fieldName == this.context.key && ctx == this.context.value*/) { // ? key一样, value一样, 什么场景会发生?
          context = this.context; // 不变
        } else {
          let contextR: ParseContext = new ParseContext(this.context);
          if (context == null) {
            context = contextR;
          }
          setContextFlag = true;
        }
      }

      if (key == null) {
        key = "null";
      }

      //-- value
      // 解析 key 结束后, 立马校验了':', 直接看 value

      let value;
      if (ch == char('"')) {
        this.lexer.scanString();
        let strValue = this.lexer.stringValue();
        value = strValue;

        /*if (lexer.isEnabled(Feature.AllowISO8601DateFormat)) {
          JSONScanner iso8601Lexer = new JSONScanner(strValue);
          if (iso8601Lexer.scanISO8601DateIfMatch()) {
            value = iso8601Lexer.getCalendar().getTime();
          }
          iso8601Lexer.close();
        }*/

        const jsonItem = new JsonItem(context, key, value);
        context?.add(jsonItem);
      } else if (ch >= char('0') && ch <= char('9') || ch == char('-')) {
        this.lexer.scanNumber();
        value = this.lexer.numberValue();
        const jsonItem = new JsonItem(context, key, value);
        context?.add(jsonItem);
      } else if (ch == char('[')) {
        this.lexer.nextToken();
        let list = [];

        const parentIsArray = fieldName != null && fieldName instanceof Number;

        if (fieldName == null) { // root?
          this.context = context;
        }

        this.parseArray(list, key); // todo

        value = list;

        const jsonItem = new JsonItem(context, key, value);
        context?.add(jsonItem);

        if (this.lexer.token() == JsonToken.RBRACE) { // [{},{},...]
          this.lexer.nextToken();
          return ctx;
        } else if (this.lexer.token() == JsonToken.COMMA) {
          continue;
        } else {
          throw new Error("syntax error");
        }
      } else if (ch == char('{')) {
        this.lexer.nextToken();

        const parentIsArray = fieldName != null && fieldName instanceof Number;

        if (!parentIsArray) { // key: {...}
          context = this.setContext(key, null, this.context); // value 非基础值
        }

        value = this.parseObject(context, key);

        const jsonItem = new JsonItem(context, key, value);
        context?.add(jsonItem);

        if (this.lexer.token() == JsonToken.RBRACE) { // {...}
          this.lexer.nextToken();
          this.context = context;
          return ctx;
        } else if (this.lexer.token() == JsonToken.COMMA) {
          // todo
          continue;
        } else {
          throw new Error("syntax error, " + this.lexer.tokenName());
        }
      } else {
        // todo
      }

      this.lexer.skipWhitespace();
      ch = this.lexer.getCurrent();
      if (ch == char(',')) {
        this.lexer.next();
        continue;
      } else if (ch == char('}')) {
        this.lexer.next();
        this.lexer.resetStringPosition();
        this.lexer.nextToken();

        // this.setContext(object, fieldName);
        // this.setContext(key, value, null); // ? 最后一项, 单独设置一次 context, 意义是什么 ?

        return ctx;
      } else {
        throw new Error("syntax error, position at " + this.lexer.pos() + ", name " + key);
      }
    }


    this.context = context; // 复位
  }

  parse() {
    const rootCtx = new ParseContext(null);
    return this.parseObject(rootCtx, null);
  }

  // setContext(key: any, value: any, parent: JsonContext|null) {
  //   parent = parent || this.context;
  //   this.context = new ParseContext(key, value, parent);
  //   this.contextArray.push(this.context);
  //   return this.context;
  // }

}

/**
 * {...} [...] 为 context
 */
class ParseContext {
  parent: ParseContext|null = null;
  items: JsonItem[] = [];

  constructor(parent: ParseContext|null) {
    this.parent = parent;
  }

  add(item: JsonItem) {
    this.items.push(item);
  }
}

/**{...}*/
class JsonObjectContext extends ParseContext {
}

/**[...]*/
class JsonArrayContext extends ParseContext {
}

class JsonItem {
  /**所在的 context*/
  context: ParseContext;
  key: null | string = null;
  value: any = null;
  // valueType: ValueType | undefined;
  comment: string = '';

  constructor(context: ParseContext | null, key: any, value: any) {
    this.context = context;
    this.key = key;
    this.value = value;
  }
}

// class JsonContext {
//   key = null;
//   value = null;
//   comment:string|null = null;
//   parent: JsonContext | null = null;
//   children: JsonContext[] = [];
//
//   constructor(key: any, value: any, parent: JsonContext | null) {
//     this.key = key;
//     this.value = value;
//     this.parent = parent;
//   }
//
//   appendChild(key: any, value: any, comment: string|null): JsonContext {
//     let child = new JsonContext(key, value, this);
//     child.comment = comment;
//     this.children.push(child);
//     return this;
//   }
//
//   static newRootContext() {
//     return new JsonContext(null, null, null);
//   }
// }

class JsonMeta {
  static parse(text: string) {

    const parser = new JsonParser(text);
    const result = parser.parse();
  }
}