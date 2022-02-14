function char(str:string) {
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

  name:string;

  constructor(name: string) {
    this.name = name;
  }
}



class JsonLexer {
  static EOI            = 0x1A
  text = '';
  bp;
  // string pos ?
  sp;
  np;
  pos;
  len;
  ch = -1;
  _token: JsonToken;

  constructor(input:string) {
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

  }

  nextToken() {

  }

  getCurrent() {
    return this.ch;
  }

  next():number {
    const index = ++this.bp;
    return this.ch = (index >= this.len ? //
        JsonLexer.EOI //
        : this.text.charCodeAt(index));
  }

  scanSymbol(quote: string) {
    this.np = this.bp;
    this.sp = 0;
    let chLocal:number;

    for (;;) {
      chLocal = this.next();

      if (chLocal == char(quote)) {
        break;
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

  scanNumber() {

  }

  numberValue() {
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
        + ", column "+column;

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

  constructor(input:string) {
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

  parseObject(ctx, fieldName) {
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

    if (this.lexer.token() != JsonToken.LBRACE && this.lexer.token() != JsonToken.COMMA) {
      throw new Error("syntax error, expect {, actual " + this.lexer.tokenName() + ", " + this.lexer.info());
    }

    for (;;) {
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
    }


  }

  parse() {
    const jsonContext = new JsonContext();
    return this.parseObject(jsonContext, null);
  }
}

class JsonContext {
  key = null;
  value = null;
  comment = null;
  parent:JsonContext|null = null;
  children:JsonContext[] = [];
}

class JsonMeta {
  static parse(text:string) {

    const parser = new JsonParser(text);
    const result = parser.parse();
  }
}