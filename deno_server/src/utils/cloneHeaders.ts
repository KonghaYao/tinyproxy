/** 复制头部 */
export const cloneHeaders = (headers: Headers) => {
    const newHeader = new Headers();
    for (const i of headers.entries()) {
        newHeader.append(...i);
    }
    return newHeader;
};

export const assignHeaders = (
    header1: Headers,
    header2: Headers,
    overwrite = false
) => {
    // console.log([...header1.entries()], [...header2.entries()]);
    for (const i of header2.entries()) {
        header1[overwrite ? "set" : "append"](...i);
    }
    return header1;
};
