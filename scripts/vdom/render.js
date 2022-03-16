const renderElem = (vNode) => {
    const $el = document.createElement(vNode.tag);

    for (const [k, v] of Object.entries(vNode.attrs)) {
        if (typeof v === 'function') {
            $el.addEventListener(k, e => v());
            continue;
        }
        $el.setAttribute(k, v);
    }

    for (const child of vNode.children) {
        $el.appendChild(render(child));
    }

    return $el;
}

const render = (vNode) => {
    if (typeof vNode === 'string') {
        return document.createTextNode(vNode);
    }

    return renderElem(vNode);
}

export default render;