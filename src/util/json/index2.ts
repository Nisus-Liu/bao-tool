function char(str:string) {
  if (str == null) {
    return -1;
  }
  if (str.length > 1) {
    throw new Error("'str' must len 1");
  }
  return str.charCodeAt(0);
}

class JsonToken {
  static LPAREN = new JsonToken("(");
  static RPAREN = new JsonToken(")");
  static LBRACE = new JsonToken("{");
  static RBRACE = new JsonToken("}");
  static LBRACKET = new JsonToken("[");
  static RBRACKET = new JsonToken("]");
  static COMMA = new JsonToken(",");
  static COLON = new JsonToken(":");

  name:string;

  constructor(name: string) {
    this.name = name;
  }
}



class JsonLexer {
  static EOI            = 0x1A
  text;
  bp;
  len;
  ch = -1;
  _token:JsonToken|null = null;

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

  }

  skipWhitespace() {

  }

  nextToken() {

  }

  getCurrent() {
    return this.ch;
  }

  next() {
    const index = ++this.bp;
    return this.ch = (index >= this.len ? //
        JsonLexer.EOI //
        : this.text.charCodeAt(index));
  }

  scanSymbol(quote: string) {

  }

  scanNumber() {

  }

  numberValue() {
  }

  scanString() {

  }

  stringValue() {

  }
}

class JsonParser {
  input;
  lexer;

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