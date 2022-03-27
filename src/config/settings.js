import { EnvironmentUtils } from '../utils/environmentUtils.js';
import { WebStorageConstants } from '../constants/webStorageConstants.js';

// Define settings names
const Names = {
    AutoFlipBoard: 'autoFlipBoard',
    EnableMoveUndo: 'enableMoveUndo',
};

// Define default settings
const _defaultSettings = {
    [Names.AutoFlipBoard]: EnvironmentUtils.isNodeEnvironment(),
    [Names.EnableMoveUndo]: false,
};

// Set cached settings
let settings = loadSettings();

function loadSettings() {
    const settings = localStorage.getItem(WebStorageConstants.SETTINGS);
    if (settings) {
        try {
            return JSON.parse(settings);
        } catch (_) {
            console.warn("Couldn't parse settings, returning default settings");
        }
    }
    return JSON.parse(JSON.stringify(_defaultSettings));
}

function saveSettings() {
    localStorage.setItem(WebStorageConstants.SETTINGS, JSON.stringify(settings));
}

/**
 * @param {type: Settings.Names} setting
 * @param {type: any} value
 */
function setSetting(setting, value) {
    settings[setting] = value;
    saveSettings();
}

/**
 * @param {type: Settings.Names} setting
 */
function getSetting(setting) {
    return settings[setting];
}

export const Settings = {
    getSetting,
    setSetting,
    Names,
};
