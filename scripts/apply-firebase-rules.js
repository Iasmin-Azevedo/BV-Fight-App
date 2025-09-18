#!/usr/bin/env node

/**
 * Script para aplicar as regras do Firebase Firestore
 * Execute este script após atualizar o arquivo firebase-rules.txt
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 Aplicando regras do Firebase Firestore...\n');

// Ler o arquivo de regras
const rulesPath = path.join(__dirname, '..', 'firebase-rules.txt');
const rulesContent = fs.readFileSync(rulesPath, 'utf8');

console.log('📋 Regras encontradas:');
console.log('─'.repeat(50));
console.log(rulesContent);
console.log('─'.repeat(50));

console.log('\n📝 Para aplicar essas regras:');
console.log('1. Acesse o Console do Firebase: https://console.firebase.google.com/');
console.log('2. Selecione o projeto "bv-fight"');
console.log('3. Vá para Firestore Database > Rules');
console.log('4. Cole o conteúdo do arquivo firebase-rules.txt');
console.log('5. Clique em "Publish"');

console.log('\n🔗 Link direto: https://console.firebase.google.com/v1/r/project/bv-fight/firestore/rules');

console.log('\n✅ Regras prontas para aplicação!');
