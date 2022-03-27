import {ItemType, ParseContext} from "@/util/json";
import {DateFormat} from "@/util";


export function json2JavaBean(context: ParseContext) {
  return `// Auto generate at ${new DateFormat().format(DateFormat.DATE_TIME_FMT)}
${context.comment?.trim()}
public class JavaBean {
    ${context.children?.map(it => {
    let type = 'Object';
    switch (it.type) {
        case ItemType.STRING:
            type = 'String';
            break;
        case ItemType.BOOL:
            type = "Boolean";
            break;
        case ItemType.INT_NUMBER:
            type = "Integer";
            break
        case ItemType.FLOAT_NUMBER:
            type = "BigDecimal";
            break;
        case ItemType.ARRAY:
            type = "List<?>";
            break;
    }

    return `${it.comment ? it.comment.trim() : ''}
    private ${type} ${it.key};`
}).join('\n    ')}
}`
}