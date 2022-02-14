import { EnvironmentUtils } from '../utils/environmentUtils.js';

const autoFlipBoard = EnvironmentUtils.isNodeEnvironment();

export const Settings = {
    autoFlipBoard,
};
