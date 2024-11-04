const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    '@clerk/clerk-expo': require.resolve('@clerk/clerk-expo'),
    '@clerk/clerk-react': require.resolve('@clerk/clerk-react'),
};

module.exports = withNativeWind(config, { input: "./global.css" });