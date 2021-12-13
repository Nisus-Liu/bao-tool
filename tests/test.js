

let src = "/** \n *" +
  "  6\n  " +
  "* ljg\n" +
  "*   hjgljgl\n" +
  "  *  和 来说就是了几个\n" +
  "*/";
let src1 = '\'val ue\'';
let src2 = '"valu  eee"';

let regExp = /\/\*\**([\s\S]*)\*\//;
let res = regExp.exec(src);
console.log(res)
console.log(res[1].replaceAll(/\n\s*\*/g, '\n'));

console.log(regExp.exec(src1));
console.log(regExp.exec(src2));

// throw new Error(null)