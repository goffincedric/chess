function isBrowserEnvironment() {
    return typeof process !== 'object';
}

function isNodeEnvironment() {
    return typeof process === 'object';
}

export const EnvironmentUtils = {
    isBrowserEnvironment,
    isNodeEnvironment,
};
