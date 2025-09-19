const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Adicionar suporte para arquivos .ts
config.resolver.sourceExts.push('ts', 'tsx');

// Configurar resolução de módulos
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Adicionar suporte para extensões de arquivo
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'svg', 'ttf', 'otf');

module.exports = config;
