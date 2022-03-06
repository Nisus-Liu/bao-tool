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
  static ERROR = new JsonToken("error");
  static NULL = new JsonToken("null");
  static UNDEFINED = new JsonToken("undefined");
  static LPAREN = new JsonToken("(");
  static RPAREN = new JsonToken(")");
  static LBRACE = new JsonToken("{");
  static RBRACE = new JsonToken("}");
  static LBRACKET = new JsonToken("[");
  static RBRACKET = new JsonToken("]");
  static COMMA = new JsonToken(",");
  static COLON = new JsonToken(":");
  static SEMI = new JsonToken(";");
  static DOT = new JsonToken(".");
  static LITERAL_STRING = new JsonToken("string")
  static LITERAL_NUMBER = new JsonToken("number")
  static TRUE = new JsonToken("true")
  static FALSE = new JsonToken("false")
  static IDENTIFIER = new JsonToken("identifier")
  static EOF = new JsonToken("eof")

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
  sp = 0;
  np = 0;
  pos = 0;
  eofPos = 0;
  len;
  ch = -1;
  _token: JsonToken | undefined;

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
    return this._token?.name;
  }

  skipWhitespace() {
    for (; ;) {
      if (this.ch <= char('/')) {
        if (this.isWhitespace(this.ch)) {
          this.next();
          continue;
        } else if (this.ch == char('/')) {
          this.skipComment();
          continue;
        } else {
          break;
        }
      } else {
        break;
      }
    }
  }

  skipComment() {
    this.next();
    if (this.ch == char('/')) {
      for (; ;) {
        this.next();
        if (this.ch == char('\n')) {
          this.next();
          return;
        } else if (this.ch == JsonLexer.EOI) {
          return;
        }
      }
    } else if (this.ch == char('*')) {
      this.next();

      for (; this.ch != JsonLexer.EOI;) {
        if (this.ch == char('*')) {
          this.next();
          if (this.ch == char('/')) {
            this.next();
            return;
          } else {
            continue;
          }
        }
        this.next();
      }
    } else {
      throw new Error("invalid comment");
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
    this.sp = 0;

    for (; ;) {
      this.pos = this.bp;

      if (this.ch == char('/')) {
        this.skipComment();
        continue;
      }

      if (this.ch == char('"')) {
        this.scanString();
        return;
      }

      if (this.ch == char(',')) {
        this.next();
        this._token = JsonToken.COMMA;
        return;
      }

      if (this.ch >= char('0') && this.ch <= char('9')) {
        this.scanNumber();
        return;
      }

      if (this.ch == char('-')) {
        this.scanNumber();
        return;
      }

      switch (this.ch) {
        case char('\''):
          // if (!isEnabled(Feature.AllowSingleQuotes)) {
          //   throw new JSONException("Feature.AllowSingleQuotes is false");
          // }
          // this.scanStringSingleQuote();
          this.scanSymbol("'");
          return;
        case char(' '):
        case char('\t'):
        case char('\b'):
        case char('\f'):
        case char('\n'):
        case char('\r'):
          this.next();
          break;
        case char('t'): // true
          this.scanTrue();
          return;
        case char('f'): // false
          this.scanFalse();
          return;
        case char('n'): // new,null
          // this.scanNullOrNew();
          this.scanNull();
          return;
        case char('T'):
        case char('N'): // NULL
        case char('S'):
        case char('u'): // undefined
          this.scanIdent();
          return;
        case char('('):
          this.next();
          this._token = JsonToken.LPAREN;
          return;
        case char(')'):
          this.next();
          this._token = JsonToken.RPAREN;
          return;
        case char('['):
          this.next();
          this._token = JsonToken.LBRACKET;
          return;
        case char(']'):
          this.next();
          this._token = JsonToken.RBRACKET;
          return;
        case char('{'):
          this.next();
          this._token = JsonToken.LBRACE;
          return;
        case char('}'):
          this.next();
          this._token = JsonToken.RBRACE;
          return;
        case char(':'):
          this.next();
          this._token = JsonToken.COLON;
          return;
        case char(';'):
          this.next();
          this._token = JsonToken.SEMI;
          return;
        case char('.'):
          this.next();
          this._token = JsonToken.DOT;
          return;
        case char('+'):
          this.next();
          this.scanNumber();
          return;
          // case char('x'):
          //   this.scanHex();
          //   return;
        default:
          if (this.isEOF()) { // JLS
            if (this._token == JsonToken.EOF) {
              throw new Error("EOF error");
            }

            this._token = JsonToken.EOF;
            this.eofPos = this.pos = this.bp;
          } else {
            if (this.ch <= 31 || this.ch == 127) {
              this.next();
              break;
            }

            this.lexError("illegal.char", str(this.ch));
            this.next();
          }

          return;
      }
    }

  }

  nextTokenExpect(expect: JsonToken) {
    return this.nextToken(); // 暂
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
    this.np = this.bp;

    if (this.ch == char('-')) {
      this.sp++;
      this.next();
    }

    for (; ;) {
      if (this.ch >= char('0') && this.ch <= char('9')) {
        this.sp++;
      } else {
        break;
      }
      this.next();
    }

    let isDouble = false;

    if (this.ch == char('.')) {
      this.sp++;
      this.next();
      isDouble = true;

      for (; ;) {
        if (this.ch >= char('0') && this.ch <= char('9')) {
          this.sp++;
        } else {
          break;
        }
        this.next();
      }
    }

    if (this.sp > 65535) {
      throw new Error("scanNumber overflow");
    }

    if (this.ch == char('L')) {
      this.sp++;
      this.next();
    } else if (this.ch == char('S')) {
      this.sp++;
      this.next();
    } else if (this.ch == char('B')) {
      this.sp++;
      this.next();
    } else if (this.ch == char('F')) {
      this.sp++;
      this.next();
      isDouble = true;
    } else if (this.ch == char('D')) {
      this.sp++;
      this.next();
      isDouble = true;
    } else if (this.ch == char('e') || this.ch == char('E')) {
      this.sp++;
      this.next();

      if (this.ch == char('+') || this.ch == char('-')) {
        this.sp++;
        this.next();
      }

      for (; ;) {
        if (this.ch >= char('0') && this.ch <= char('9')) {
          this.sp++;
        } else {
          break;
        }
        this.next();
      }

      if (this.ch == char('D') || this.ch == char('F')) {
        this.sp++;
        this.next();
      }

      isDouble = true;
    }

    // if (isDouble) {
    //   token = JSONToken.LITERAL_FLOAT;
    // } else {
    //   token = JSONToken.LITERAL_INT;
    // }
    this._token = JsonToken.LITERAL_NUMBER;
  }

  scanTrue() {
    if (this.ch != char('t')) {
      throw new Error("error parse true");
    }
    this.next();

    if (this.ch != char('r')) {
      throw new Error("error parse true");
    }
    this.next();

    if (this.ch != char('u')) {
      throw new Error("error parse true");
    }
    this.next();

    if (this.ch != char('e')) {
      throw new Error("error parse true");
    }
    this.next();

    if (this.ch == char(' ') ||
        this.ch == char(',') ||
        this.ch == char('}') ||
        this.ch == char(']') ||
        this.ch == char('\n') ||
        this.ch == char('\r') ||
        this.ch == char('\t') ||
        this.ch == JsonLexer.EOI ||
        this.ch == char('\f') ||
        this.ch == char('\b') ||
        this.ch == char(':') ||
        this.ch == char('/')) {
      this._token = JsonToken.TRUE;
    } else {
      throw new Error("scan true error");
    }
  }

  scanFalse() {
    if (this.ch != char('f')) {
      throw new Error("error parse false");
    }
    this.next();

    if (this.ch != char('a')) {
      throw new Error("error parse false");
    }
    this.next();

    if (this.ch != char('l')) {
      throw new Error("error parse false");
    }
    this.next();

    if (this.ch != char('s')) {
      throw new Error("error parse false");
    }
    this.next();

    if (this.ch != char('e')) {
      throw new Error("error parse false");
    }
    this.next();

    if (this.ch == char(' ') ||
        this.ch == char(',') ||
        this.ch == char('}') ||
        this.ch == char(']') ||
        this.ch == char('\n') ||
        this.ch == char('\r') ||
        this.ch == char('\t') ||
        this.ch == JsonLexer.EOI ||
        this.ch == char('\f') ||
        this.ch == char('\b') ||
        this.ch == char(':') ||
        this.ch == char('/')) {
      this._token = JsonToken.FALSE;
    } else {
      throw new Error("scan false error");
    }
  }

  scanNull() {
    if (this.ch != char('n')) {
      throw new Error("error parse null");
    }
    this.next();

    if (this.ch != char('u')) {
      throw new Error("error parse null");
    }
    this.next();

    if (this.ch != char('l')) {
      throw new Error("error parse null");
    }
    this.next();

    if (this.ch != char('l')) {
      throw new Error("error parse null");
    }
    this.next();

    if (this.isWhitespace(this.ch)
        || this.ch == char(',')
        || this.ch == char('}')
        || this.ch == char(']')
        || this.ch == JsonLexer.EOI
    ) {
      this._token = JsonToken.NULL;
    } else {
      throw new Error("scan null error");
    }
    return;
  }

  scanIdent() {
    this.np = this.bp - 1;
    // hasSpecial = false;

    for (; ;) {
      this.sp++;

      this.next();
      if ((this.ch >= char('A') && this.ch <= char('Z'))
          || (this.ch >= char('a') && this.ch <= char('z'))
          || (this.ch >= char('0') && this.ch <= char('9'))
      ) {
        continue;
      }
    }

    let ident = this.stringValue();

    if ("null" == ident.toLowerCase()) {
      this._token = JsonToken.NULL;
    } /*else if ("new" == ident.toLowerCase()) {
      this._token = JsonToken.NEW;
    }*/ else if ("true" == ident.toLowerCase()) {
      this._token = JsonToken.TRUE;
    } else if ("false" == ident.toLowerCase()) {
      this._token = JsonToken.FALSE;
    } else if ("undefined" == ident.toLowerCase()) {
      this._token = JsonToken.UNDEFINED;
    } /*else if ("Set" == ident.toLowerCase()) {
      this._token = JsonToken.SET;
    } else if ("TreeSet" == ident.toLowerCase()) {
      this._token = JsonToken.TREE_SET;
    }*/ else {
      this._token = JsonToken.IDENTIFIER;
    }
    return;
  }

  scanString() {
    return this.scanSymbol(""); // 暂
  }

  numberValue() {
    const chLocal = this.text.charAt(this.np + this.sp - 1);

    let sp = this.sp;
    if (chLocal == 'L' || chLocal == 'S' || chLocal == 'B' || chLocal == 'F' || chLocal == 'D') {
      sp--;
    }

    const s = this.text.substr(this.np, sp);

    return Number(s); // 暂
  }

  stringValue() {
    return this.text.substr(this.np + 1, this.sp);
  }

  isEOF() {
    return this.bp == this.len || (this.ch == JsonLexer.EOI && this.bp + 1 >= this.len);
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

  lexError(key: any, ...args: any) {
    this._token = JsonToken.ERROR;
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
  parseObject(ctx: JsonObjectContext, fieldName: any) {
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
      let key: any;
      if (ch == char('"')) {
        key = this.lexer.scanSymbol('"');
        this.lexer.skipWhitespace();
        ch = this.lexer.getCurrent();
        if (ch != char(':')) {
          throw new Error("expect ':' at " + this.lexer.pos + ", name " + key);
        }
      } else if (ch == char('}')) {
        this.lexer.next();
        this.lexer.resetStringPosition();
        this.lexer.nextToken();

        if (!setContextFlag) {
          if (this.context != null /*&& fieldName == this.context.key && ctx == this.context.value*/) { // ? key一样, value一样, 什么场景会发生?
            context = this.context; // 不变
          } else {
            let contextR: ParseContext = new JsonObjectContext(this.context);
            if (context == null) {
              context = contextR;
            }
            setContextFlag = true;
          }
        }

        return context;
      } else if (ch == char('\'')) {
        key = this.lexer.scanSymbol('\'');
        this.lexer.skipWhitespace();
        ch = this.lexer.getCurrent();
        if (ch != char(':')) {
          throw new Error("expect ':' at " + this.lexer.pos + ", name " + key);
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
          throw new Error("expect ':' at " + this.lexer.pos + ", actual " + ch);
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
          let contextR: ParseContext = new JsonObjectContext(this.context);
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

        const jsonItem = new JsonItemContext(context, key, value);
        context?.add(jsonItem);
      } else if (ch >= char('0') && ch <= char('9') || ch == char('-')) {
        this.lexer.scanNumber();
        value = this.lexer.numberValue();
        const jsonItem = new JsonItemContext(context, key, value);
        context?.add(jsonItem);
      } else if (ch == char('[')) {
        this.lexer.nextToken();

        const parentIsArray = fieldName != null && fieldName instanceof Number;

        if (fieldName == null) { // root?
          this.context = context;
        }

        const arrayCtx = new JsonArrayContext(context);
        this.parseArray(arrayCtx, key); // 内部不需要 new context 了, item 直接添加. todo

        context?.add(arrayCtx);

        if (this.lexer.token() == JsonToken.RBRACE) { // `{... []}`
          this.lexer.nextToken();
          return ctx;
        } else if (this.lexer.token() == JsonToken.COMMA) { // `k: [],`
          continue;
        } else {
          throw new Error("syntax error");
        }
      } else if (ch == char('{')) { // fastjson-1.2.73-sources.jar!/com/alibaba/fastjson/parser/DefaultJSONParser.java:537
        this.lexer.nextToken();

        const parentIsArray = fieldName != null && fieldName instanceof Number;

        // if (!parentIsArray) { // key: {...}
        //   context = new JsonObjectContext(context);
        // }
        const objectCtx = new JsonObjectContext(context);

        this.parseObject(objectCtx, key);

        context?.add(objectCtx);

        if (this.lexer.token() == JsonToken.RBRACE) { // {...}
          this.lexer.nextToken();
          this.context = context;
          return ctx;
        } else if (this.lexer.token() == JsonToken.COMMA) {
          this.context = context;
          continue;
        } else {
          throw new Error("syntax error, " + this.lexer.tokenName());
        }
      } else { // 非一般value, 咱不考虑
        // to-do
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
        throw new Error("syntax error, position at " + this.lexer.pos + ", name " + key);
      }
    }


    this.context = context; // 复位
  }

  /**
   * fastjson-1.2.73-sources.jar!/com/alibaba/fastjson/parser/DefaultJSONParser.java:1162
   * @param ctx
   * @param fieldName
   */
  parseArray(ctx: JsonArrayContext, fieldName: any) {
    const lexer = this.lexer;

    if (lexer.token() != JsonToken.LBRACKET) {
      throw new Error("syntax error, expect [, actual " + lexer.tokenName() + ", pos "
          + lexer.pos + ", fieldName " + fieldName);
    }

    lexer.nextTokenExpect(JsonToken.LITERAL_STRING);

    // if (this.context != null && this.context.level > 512) {
    //   throw new JSONException("array level > 512");
    // }

    let context = ctx;
    try {
      for (let i = 0; ; ++i) {
        // if (lexer.isEnabled(Feature.AllowArbitraryCommas)) {
        while (lexer.token() == JsonToken.COMMA) {
          lexer.nextToken();
          continue;
        }
        // }

        // @ts-ignore
        let value: ParseContext = null;
        switch (lexer.token()) {
          case JsonToken.LITERAL_NUMBER:
            value = new JsonItemContext(context, i, lexer.numberValue());
            lexer.nextTokenExpect(JsonToken.COMMA);
            break;
          case JsonToken.LITERAL_STRING:
            let stringLiteral = lexer.stringValue();
            lexer.nextTokenExpect(JsonToken.COMMA);

            // if (lexer.isEnabled(Feature.AllowISO8601DateFormat)) {
            //   JSONScanner iso8601Lexer = new JSONScanner(stringLiteral);
            //   if (iso8601Lexer.scanISO8601DateIfMatch()) {
            //     value = iso8601Lexer.getCalendar().getTime();
            //   } else {
            //     value = stringLiteral;
            //   }
            //   iso8601Lexer.close();
            // } else {
            value = new JsonItemContext(context, i, stringLiteral);
            // }

            break;
          case JsonToken.TRUE:
            value = new JsonItemContext(context, i, true);
            lexer.nextTokenExpect(JsonToken.COMMA);
            break;
          case JsonToken.FALSE:
            value = new JsonItemContext(context, i, false);
            lexer.nextTokenExpect(JsonToken.COMMA);
            break;
          case JsonToken.LBRACE:
            const objectCtx = new JsonObjectContext(context);
            this.parseObject(objectCtx, i);
            value = objectCtx;
            break;
          case JsonToken.LBRACKET:
            const arrayCtx = new JsonArrayContext(context);
            this.parseArray(arrayCtx, i);
            value = arrayCtx;
            break;
          case JsonToken.NULL:
            value = new JsonItemContext(context, i, null);
            lexer.nextTokenExpect(JsonToken.LITERAL_STRING);
            break;
          case JsonToken.UNDEFINED:
            value = new JsonItemContext(context, i, null);
            lexer.nextTokenExpect(JsonToken.LITERAL_STRING);
            break;
          case JsonToken.RBRACKET:
            lexer.nextTokenExpect(JsonToken.COMMA);
            return;
          case JsonToken.EOF:
            throw new Error("unclosed jsonArray");
          default:
            // value = parse(); // 咱不考虑
            break;
        }

        value && context.add(value);
        // checkListResolve(array);

        if (lexer.token() == JsonToken.COMMA) {
          lexer.nextTokenExpect(JsonToken.LITERAL_STRING);
          continue;
        }
      }
    } finally {
      this.context = context;
    }
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
 * {...}, [...], 字段k-v 都可以认为是 context
 */
class ParseContext {
  key = null;
  // 简单值时用
  value = null;
  // {},[] 时用
  children: ParseContext[] = [];
  parent: ParseContext | null = null;
  comment = null;

  constructor(parent: ParseContext | null) {
    this.parent = parent;
  }

  add(item: ParseContext) {
    this.children.push(item);
  }
}

/**{...}*/
class JsonObjectContext extends ParseContext {
}

/**[...]*/
class JsonArrayContext extends ParseContext {
}

class JsonItemContext extends ParseContext {

  constructor(parent: ParseContext | null, key: any, value: any) {
    super(parent);
    this.key = key;
    this.value = value;
  }
}

//
// class JsonItem {
//   /**所在的 context*/
//   context: ParseContext;
//   key: null | string = null;
//   value: any = null;
//   // valueType: ValueType | undefined;
//   comment: string = '';
//
//   constructor(context: ParseContext | null, key: any, value: any) {
//     this.context = context;
//     this.key = key;
//     this.value = value;
//   }
// }

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