
export function isExternalURL(url) {
    try {
        const parsedURL = new URL(url);
        
        const urlHostname = parsedURL.hostname;

        const siteHostname = window.location.hostname;

        const isExternal = !urlHostname.endsWith(siteHostname);

        return isExternal;
    } catch (error) {
        console.error('Invalid URL:', error);
        return false;
    }
}