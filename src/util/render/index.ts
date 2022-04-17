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

// ----
const JSON_SCHEMA_DRAFT = "http://json-schema.org/draft-04/schema#"

export function json2Jsonschema(context: ParseContext, isRoot = true) {
    let sc = {};
    if (context.comment) {
        sc['description'] = context.comment;
    }

    switch (context.type) {
        case ItemType.OBJECT:
            jsonObject2Jsonschema(context, sc);
            break;
        case ItemType.ARRAY:
            jsonArray2Jsonschema(context, sc);
            break;
        case ItemType.STRING:
            sc['type'] = 'string';
            break;
        case ItemType.BOOL:
            sc['type'] = 'boolean';
            break;
        case ItemType.INT_NUMBER:
            sc['type'] = 'integer';
            break
        case ItemType.FLOAT_NUMBER:
            sc['type'] = 'number';
            break;
        default:
    }

    if (isRoot) {
        sc['$schema'] = JSON_SCHEMA_DRAFT;
    }

    return sc;
}

function jsonObject2Jsonschema(context: ParseContext, schemaResult: Record<string, unknown>) {
    if (context.type !== ItemType.OBJECT) {
        throw new Error("jsonObject2Jsonschema 仅支持 ItemType.OBJECT");
    }
    schemaResult['type'] = 'object';
    context.comment && (schemaResult['description'] = context.comment);

    let propsSc = schemaResult['properties'] = {}
    context.children?.forEach(prop => {
        let propSc = {};
        switch (prop.type) {
            case ItemType.OBJECT:
                jsonObject2Jsonschema(prop, propSc);
                break;
            case ItemType.ARRAY:
                jsonArray2Jsonschema(prop, propSc)
                break;
            case ItemType.STRING:
                propSc['type'] = 'string';
                break;
            case ItemType.BOOL:
                propSc['type'] = 'boolean';
                break;
            case ItemType.INT_NUMBER:
                propSc['type'] = 'integer';
                break
            case ItemType.FLOAT_NUMBER:
                propSc['type'] = 'number';
                break;
        }
        prop.comment && (propSc['description'] = prop.comment);
        propsSc[prop.key + ''] = propSc;
    })

    return schemaResult;
}

function jsonArray2Jsonschema(context: ParseContext, schemaResult: Record<string, unknown>) {
    if (context.type !== ItemType.ARRAY) {
        throw new Error("jsonArray2Jsonschema 仅支持 ItemType.ARRAY");
    }

    schemaResult['type'] = 'array';
    context.comment && (schemaResult['description'] = context.comment);

    // items , 去第一个解析, 多个item, 但类型不一致, 我不管了!
    let itemsSc:any = null;
    if (context.children && context.children.length > 0) {
        const first = context.children[0];
        itemsSc = json2Jsonschema(first, false);
    } else {
        // 缺省一个
        itemsSc = {
            type: 'string'
        }
    }
    schemaResult['items'] = itemsSc;

    return schemaResult;
}