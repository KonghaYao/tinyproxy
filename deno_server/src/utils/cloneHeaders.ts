/** 复制头部 */
export const cloneHeaders = (headers: Headers) => {
    const newHeader = new Headers();
    for (const i of headers.entries()) {
        newHeader.append(...i);
    }
    return newHeader;
};
