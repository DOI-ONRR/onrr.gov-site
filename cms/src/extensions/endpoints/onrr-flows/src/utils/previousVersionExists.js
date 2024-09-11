export function previousVersionExists(previousVersion) {
    return !!previousVersion || (Array.isArray(previousVersion) && previousVersion.length > 0);
}