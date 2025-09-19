const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Adicionar suporte para arquivos .ts
config.resolver.sourceExts.push('ts', 'tsx');

module.exports = config;
