import createElement from "./vdom/createElement.js";
import render from "./vdom/render.js";
import mount from "./vdom/mount.js";
import diff from "./vdom/diff.js";

const createVApp = (count, addCount, minusCount) => createElement('div', {
    attrs: {
        id: 'app',
    },
    children: [
        createElement('div', {
            children: [
                createElement('button', {
                    attrs: {
                        type: 'button',
                        click: addCount,
                    },
                    children: [
                        '++count',
                    ],
                }),
                createElement('button', {
                    attrs: {
                        type: 'button',
                        click: minusCount,
                    },
                    children: [
                        '--count',
                    ],
                }),
            ],
        }),
        createElement('div', {
            attrs: {
                dataCount: count,
            },
            children: [
                `current count: ${count}`,
                ...Array.from({ length: count }, () => createElement('img', {
                    attrs: {
                        src: 'https://avatars.githubusercontent.com/u/31848393?v=4',
                        alt: ''
                    },
                })),
            ],
        }),
    ],
});

let count = 0;
const addCount = () => {
    ++count;
    refresh();
};

const minusCount = () => {
    if (count > 0) {
        --count;
        refresh();
    }
};

let vApp = createVApp(count, addCount, minusCount);
const $app = render(vApp);
let $rootEl = mount($app, document.querySelector('#app'));

function refresh() {
    const vNewApp = createVApp(count, addCount);
    const patch = diff(vApp, vNewApp);
    $rootEl = patch($rootEl);
    vApp = vNewApp;
}

// setInterval(() => {
//     const n = Math.floor(Math.random() * 10);
//     const vNewApp = createVApp(n);
//     const patch = diff(vApp, vNewApp);
//     $rootEl = patch($rootEl);
//     vApp = vNewApp;
// }, 1000)