const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper resolution of native modules
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;