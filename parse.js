
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
const REGEXP_START_WITH_CSS_HYPHEN = /^(css[0-9]?)-/;
const REGEXP_CSS_AND_HYPHEN = /(css)|-/g;
const REGEXP_NO_ALPHABET_HYPHEN = /[^a-z- ]/g;
const REGEXP_HYPHEN = /-/g;
const REGEXP_INSIDE_BRACKET = /{([^}]+)}/g;

const RegexpToSpace = (regexp, string) => {
    string = string.replace(regexp, ' ');
    return string;
}

const loadJson = async () => {
    let response = await fetch("./data-2.0.json")
    let jsonData = await response.json();
    return jsonData.data;
}

const getCssArray = (canIUseObj) => {
    let cssArray = [];

    for (let prop in canIUseObj) {
        if (!Object.prototype.hasOwnProperty.call(canIUseObj, prop)) {
            continue;
        }

        const category = canIUseObj[prop]['categories'][0]
        // TODO: value/att 분리
        if (REGEXP_START_WITH_CSS.test(category)) {
            let keyString = `${prop} ${canIUseObj[prop].title} ${canIUseObj[prop].keywords} ${canIUseObj[prop].description}`.toLowerCase();
            keyString = RegexpToSpace(REGEXP_START_WITH_CSS_HYPHEN, keyString);
            keyString = RegexpToSpace(REGEXP_NO_ALPHABET_HYPHEN, keyString);
            let cssObj = {
                key: keyString,
                support: canIUseObj[prop].stats,
                info: canIUseObj[prop],
            }
            cssArray.push(cssObj)
        }
    }

    return cssArray;
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
        useCssPropertySet.add(style[0].substring(1));
        // TODO: style[1] 중 특별한 value 골라서 value Set에 넣던가 해야됨
    });
    return useCssPropertySet;
}

let userCssPropertySet = new Set();
for (let i = 0; i < cssRules.length; ++i) {
    getUserCssPropertySet(cssRules[i].cssText, userCssPropertySet)
}

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

const exactWordRegex = (string) => new RegExp("(^|\\s)" + string + "(\\s|$)");
const getSupportStatFromArray = (userStyleSet, canIUseArr) => {
    let supportStats = [];
    let searchFailedStyles = new Set(userStyleSet);

    let exactWordRegexMap = new Map();
    for (style of userStyleSet) {
        exactWordRegexMap.set(style, exactWordRegex(style));
    }

    for (let i = 0; i < canIUseArr.length; ++i) {
        let keyword = canIUseArr[i].key;
        let support = canIUseArr[i].support;
        for (style of userStyleSet) {
            if (exactWordRegexMap.get(style).test(keyword)) {
                searchFailedStyles.delete(style);
                supportStats.push({
                    support: support,
                    style: style,
                    keyword: keyword,
                })
            }
        }
    }
    for (failed of searchFailedStyles) {
        console.log(`fail: ${failed}`)
    }
    return supportStats;
}

loadJson().then(response => {
    let cssArray = getCssArray(response);
    console.log(cssArray)
    const supportResult = getSupportStatFromArray(userCssPropertySet, cssArray);
    console.log(supportResult)
});

function getStyle(el, styleProp) {
    var value, defaultView = (el.ownerDocument || document).defaultView;
    // W3C standard way:
    if (defaultView && defaultView.getComputedStyle) {
        // sanitize property name to css notation
        // (hypen separated words eg. font-Size)
        styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
        return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
    } else if (el.currentStyle) { // IE
        // sanitize property name to camelCase
        styleProp = styleProp.replace(/\-(\w)/g, function (str, letter) {
            return letter.toUpperCase();
        });
        value = el.currentStyle[styleProp];
        // convert other units to pixels on IE
        if (/^\d+(em|pt|%|ex)?$/i.test(value)) {
            return (function (value) {
                var oldLeft = el.style.left, oldRsLeft = el.runtimeStyle.left;
                el.runtimeStyle.left = el.currentStyle.left;
                el.style.left = value || 0;
                value = el.style.pixelLeft + "px";
                el.style.left = oldLeft;
                el.runtimeStyle.left = oldRsLeft;
                return value;
            })(value);
        }
        return value;
    }
}