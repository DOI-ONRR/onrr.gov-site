import diff from "deep-diff";

export function versionsDiffer(previous, latest) {
    return !!diff(previous, latest);
}