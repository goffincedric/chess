
const assetMap = new Map();

function storeAsset(key, asset) {
    assetMap.set(key, asset);
}

function getAsset(key) {
    return assetMap.get(key);
}

function hasAsset(key) {
    return assetMap.has(key);
}

export const AssetUtils = {
    storeAsset,
    getAsset,
    hasAsset,
}
