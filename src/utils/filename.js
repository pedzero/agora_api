export function getFileNameFromURL(url) {
    const urlParts = url?.split('/');
    const fileName = urlParts?.pop();

    return fileName;
}
