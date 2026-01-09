const { getDefaultConfig } = require("expo/metro-config")

// Simple metro config - mobile is isolated from workspace
module.exports = getDefaultConfig(__dirname)
