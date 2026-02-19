const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Exclude backend folder from Metro bundler
config.watchFolders = [path.resolve(__dirname)];
config.resolver = config.resolver || {};
config.resolver.blockList = config.resolver.blockList || [];

// Block backend directory and node_modules from being bundled
config.resolver.blockList = [
  /backend\/.*/,
  /node_modules\/.*\/node_modules\/react-native\/.*/,
];

// Ensure we only watch frontend-related folders
config.watchFolders = [
  path.resolve(__dirname, "app"),
  path.resolve(__dirname, "assets"),
  path.resolve(__dirname, "components"),
  path.resolve(__dirname, "constants"),
  path.resolve(__dirname, "frontend"),
  path.resolve(__dirname, "hooks"),
  path.resolve(__dirname, "scripts"),
];

module.exports = config;
