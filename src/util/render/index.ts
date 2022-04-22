import {ItemType, ParseContext} from "@/util/json";
import {DateFormat} from "@/util";

/**
 * json -> java bean
 * @param context
 */
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

/**
 * json -> json schema
 * @param context
 * @param isRoot
 */
export function json2Jsonschema(context: ParseContext, isRoot = true) {
    let sc = {};
    if (context.commentMeta) {
        sc['description'] = context.commentMeta.pureComment;
    }

    switch (context.type) {
        case ItemType.OBJECT:
            jsonObject2Jsonschema(context, sc);
            break;
        case ItemType.ARRAY:
            jsonArray2Jsonschema(context, sc);
            break;
        default:
            jsonSimple2Jsonschema(context, sc);
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
    context.commentMeta && (schemaResult['description'] = context.commentMeta.pureComment);

    const propsSc = schemaResult['properties'] = {}

    const requiredFieldSet = new Set();

    context.children?.forEach(prop => {
        let propSc = {};
        switch (prop.type) {
            case ItemType.OBJECT:
                jsonObject2Jsonschema(prop, propSc);
                break;
            case ItemType.ARRAY:
                jsonArray2Jsonschema(prop, propSc);
                break;
            // case ItemType.STRING:
            //     propSc['type'] = 'string';
            //     break;
            // case ItemType.BOOL:
            //     propSc['type'] = 'boolean';
            //     break;
            // case ItemType.INT_NUMBER:
            //     propSc['type'] = 'integer';
            //     break
            // case ItemType.FLOAT_NUMBER:
            //     propSc['type'] = 'number';
            //     break;
            default:
                jsonSimple2Jsonschema(prop, propSc);
        }
        prop.commentMeta && (propSc['description'] = prop.commentMeta.pureComment);
        propsSc[prop.key + ''] = propSc;

        if (prop.commentMeta?.schemaDescriptor?.['required']) {
            requiredFieldSet.add(prop.key);
        }
    })

    schemaResult['required'] = Array.from(requiredFieldSet);

    return schemaResult;
}

function jsonArray2Jsonschema(context: ParseContext, schemaResult: Record<string, unknown>) {
    if (context.type !== ItemType.ARRAY) {
        throw new Error("jsonArray2Jsonschema 仅支持 ItemType.ARRAY");
    }

    schemaResult['type'] = 'array';
    context.commentMeta && (schemaResult['description'] = context.commentMeta.pureComment);

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

function jsonSimple2Jsonschema(context: ParseContext, schemaResult: Record<string, unknown>) {
    context.commentMeta && (schemaResult['description'] = context.commentMeta.pureComment);
    switch (context.type) {
        case ItemType.STRING:
            schemaResult['type'] = 'string';
            break;
        case ItemType.BOOL:
            schemaResult['type'] = 'boolean';
            break;
        case ItemType.INT_NUMBER:
            schemaResult['type'] = 'integer';
            break
        case ItemType.FLOAT_NUMBER:
            schemaResult['type'] = 'number';
            break;
    }

    /**
     * "mock": {
     *   "mock": "@string"
     * }
     */
    const mock = context.commentMeta?.schemaDescriptor?.['mock'];
    if (mock) {
        schemaResult['mock'] = {mock}
    }

    return schemaResult;
}