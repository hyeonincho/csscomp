export default (tag, { attrs = {}, children = [], state = {} } = {}) => {
    const vElem = Object.create(null);
    Object.assign(vElem, {
        tag,
        attrs,
        children,
        state,
    });

    return vElem;
};