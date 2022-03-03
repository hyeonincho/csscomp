
const supportScore = {
    y: 0,
    a: 1,
    x: 2,
    p: 3,
    d: 4,
    u: 5,
    n: 6,
}
const REGEXP_START_WITH_CSS = /^(css)/i;
const REGEXP_CSS_AND_HYPHEN = /(css)|-/g;
const REGEXP_HYPHEN = /-/g;
const REGEXP_INSIDE_BRACKET = /{([^}]+)}/g;

const removeRegexpString = (regexp, string) => {

    if (string.startsWith('css')) {
        string = string.substring(3)
    }

    string = string.replace(regexp, '');
    return string;
}

const loadJson = async () => {
    let response = await fetch("./data-2.0.json")
    let jsonData = await response.json();
    console.log(jsonData)
    return jsonData.data;
}

const getCssMap = (canIUseObj) => {
    let cssMap = new Map();

    for (let prop in canIUseObj) {
        if (!Object.prototype.hasOwnProperty.call(canIUseObj, prop)) {
            continue;
        }

        const category = canIUseObj[prop]['categories'][0]
        // TODO: value/att 분리
        if (REGEXP_START_WITH_CSS.test(category)) {
            let mapKey = removeRegexpString(REGEXP_CSS_AND_HYPHEN, prop);
            cssMap.set(mapKey, canIUseObj[prop].stats);
        }
    }

    return cssMap;
}

let proto = Element.prototype;
let slice = Function.call.bind(Array.prototype.slice);  // function borrow
let matches = Function.call.bind(proto.matchesSelector ||
    proto.mozMatchesSelector || proto.webkitMatchesSelector ||
    proto.msMatchesSelector || proto.oMatchesSelector);

// Returns true if a DOM Element matches a cssRule
let elementMatchCSSRule = function (element, cssRule) {
    return matches(element, cssRule.selectorText);
};

// Here we get the cssRules across all the stylesheets in one array
let cssRules = slice(document.styleSheets).reduce(function (rules, styleSheet) {
    return rules.concat(slice(styleSheet.cssRules));
}, []);

let getUserCssPropertySet = (styleSheetString, useCssPropertySet) => {
    let styles = styleSheetString.match(REGEXP_INSIDE_BRACKET)[0];
    styles = styles.replace(/^\s+|\s+$|\s+(?=\s)/g, "");
    styles = styles.substring(1, styles.length - 1);
    let styleArray = styles.split(';');
    styleArray.pop();

    styleArray.forEach(styleString => {
        let style = styleString.split(':');
        useCssPropertySet.add(removeRegexpString(REGEXP_HYPHEN, style[0].substring(1)));
        // TODO: style[1] 중 특별한 value 골라서 value Set에 넣던가 해야됨
    });
    return useCssPropertySet;
}

let userCssPropertySet = new Set();
for (let i = 0; i < cssRules.length; ++i) {
    getUserCssPropertySet(cssRules[i].cssText, userCssPropertySet)
}
console.log(userCssPropertySet)

// let getAppliedCss = function (elm) {
//     // get only the css rules that matches that element
//     let elementRules = cssRules.filter(elementMatchCSSRule.bind(null, elm));
//     let rules = [];
//     if (elementRules.length) {
//         for (i = 0; i < elementRules.length; i++) {
//             let e = elementRules[i];
//             rules.push({
//                 order: i,
//                 text: e.cssText
//             })
//         }
//     }

//     if (elm.getAttribute('style')) {
//         rules.push({
//             order: elementRules.length,
//             text: elm.getAttribute('style')
//         })
//     }
//     return rules;
// }



const getSupportStats = (userStyleSet, canIUseMap) => {
    let supportStats = [];
    console.log(userStyleSet)
    for (style of userStyleSet) {
        console.log(style)
        let obj = canIUseMap.get(style)
        console.log(obj)
        supportStats.push(obj);
    }

    return supportStats;
}

loadJson().then(response => {
    let cssMap = getCssMap(response);
    console.log(cssMap);
    let supportStats = getSupportStats(userCssPropertySet, cssMap);
    console.log(supportStats)
});

