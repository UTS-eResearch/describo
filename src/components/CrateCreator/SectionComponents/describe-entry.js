import { isEmpty, isUndefined, isString, isArray, isPlainObject } from "lodash";
import { isSimpleType } from "./component.mixins";

export function updateTemplate({ inputs, item, typeDefinitions }) {
    let template = [];
    const ignoreProperties = ["uuid", "@type", "@reverse"];
    let inputProperties = inputs.map((i) => i.property);

    // we have a type definition - populate its properties
    if (inputs.length) {
        template = inputs.map((input) => {
            // is it a simple or a complex type?

            let data = item[input.property];
            if (!data && input.multiple) {
                data = [];
            } else if (!data && !input.multiple) {
                data = "";
            } else if (
                (isString(data) || isPlainObject(data)) &&
                input.multiple
            ) {
                data = [data];
            } else if (isArray(data) && !input.multiple) {
                data = data.join(", ");
            }

            input = { ...input, data };
            return input;
        });

        // join in any properties that are not defined in the template
        // for (let property of Object.keys(item)) {
        //     if (
        //         !ignoreProperties.includes(property) &&
        //         !inputProperties.includes(property)
        //     ) {
        //         // a property is defined in the item but not in the type definition
        //         template.push({
        //             property,
        //             "@type": "Text",
        //             data: item[property],
        //         });
        //     }
        // }
    } else if (!inputs.length && Object.keys(item).length > 2) {
        // if we DON'T have a set of inputs but we DO have an item
        //  create a template with text inputs for each item property
        for (let prop of Object.keys(item)) {
            if (!ignoreProperties.includes(prop)) {
                template.push({
                    property: prop,
                    "@type": "Text",
                    data: item[prop],
                });
            }
        }
    } else {
        // if we DON'T have a set of inputs but we DO have an item
        //   without props create a template with name and description
        template = [
            { property: "name", "@type": "Text" },
            { property: "description", "@type": "TextArea" },
        ];
    }

    // add flag to determine whether to show add control
    template = template.map((item) => setFlags({ item }));
    return template;
}

export function setFlags({ item }) {
    if (item["@type"] === "Value") {
        item.showAddControl = false;
        item.enabled = true;
    } else if (item.required && !item.multiple && isSimpleType(item["@type"])) {
        item.showAddControl = false;
        item.enabled = true;
    } else if (
        item.required &&
        !item.multiple &&
        !isSimpleType(item["@type"])
    ) {
        item.showAddControl = item.data ? false : true;
        item.enabled = true;
    } else if (!item.required && item.multiple) {
        item.showAddControl = true;
        item.enabled = true;
    } else if (!item.required && !item.multiple && item.data) {
        item.showAddControl = false;
        item.enabled = true;
    } else {
        item.showAddControl = true;
        item.enabled = false;
    }

    return item;
}