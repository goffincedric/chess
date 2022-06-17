function isBrowserEnvironment() {
    return typeof window === 'object';
}

function isNodeEnvironment() {
    return typeof process === 'object';
}

export const EnvironmentUtils = {
    isBrowserEnvironment,
    isNodeEnvironment,
};
