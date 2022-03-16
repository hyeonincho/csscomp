import render from "./render.js";

const diffAttrs = (oldVAttrs, newVAttrs) => {
    const patches = [];

    for (const [k, v] of Object.entries(newVAttrs)) {
        patches.push($node => {
            $node.setAttribute(k, v);
            return $node;
        });
    }

    for (const k in oldVAttrs) {
        if (!(k in newVAttrs)) {
            patches.push($node => {
                $node.removeAttribute(k);
                return $node;
            });
        }
    }

    return $node => {
        for (const patch of patches) {
            patch($node);
        }
        return $node;
    };
}

const diffChildren = (oldVChildren, newVChildren) => {
    const childPatches = [];
    oldVChildren.forEach((oldVChild, i) => {
        childPatches.push(diff(oldVChild, newVChildren[i]));
    })
    // 기존보다 더 많은 자식요소가 있는 경우 패치
    const additionalPatches = [];
    for (const additionalVChild of newVChildren.slice(oldVChildren.length)) {
        additionalPatches.push($node => {
            $node.appendChild(render(additionalVChild));
            return $node;
        })
    }

    return $parent => {
        // childNodes는 live. 별도의 리스트에 넣어서 오류 방지
        const childNodeList = [];
        $parent.childNodes.forEach(($child) => {
            childNodeList.push($child);
        })
        childNodeList.forEach(($child, i) => {
            childPatches[i]($child);
        });

        for (const patch of additionalPatches) {
            patch($parent);
        }

        return $parent;
    };
}

const diff = (oldVTree, newVTree) => {
    // 다 삭제
    if (newVTree === undefined) {
        return ($node) => {
            $node.remove();
            return undefined;
        }
    }
    else if (typeof oldVTree === 'string' ||
        typeof newVTree === 'string') {
        if (oldVTree !== newVTree) {
            // 둘 다 text node인데 문자열이 다르거나
            // 둘 중 하나는 element node인 경우.
            return $node => {
                const $newNode = render(newVTree);
                $node.replaceWith($newNode);
                return $newNode;
            }
        }
        else {
            return $node => $node;
        }
    }
    else if (oldVTree.tag !== newVTree.tag) {
        return $node => {
            const $newNode = render(newVTree);
            $node.replaceWith($newNode);
            return $newNode;
        }
    }
    else {
        // tag는 같지만, attrs/children이 다른 경우
        const patchAttrs = diffAttrs(oldVTree.attrs, newVTree.attrs);
        const patchChildren = diffChildren(oldVTree.children, newVTree.children);

        return $node => {
            patchAttrs($node);
            patchChildren($node);
            return $node;
        }
    }
}

export default diff;