/**
 * Cores do aplicativo Tatame Digital para praticantes de jiu-jitsu.
 * Paleta de cores escura para destacar vídeos e imagens, com elementos de UI minimalistas.
 */

// Cores principais
const primaryColor = '#1E2A38'; // Azul escuro (cor principal)
const accentColor = '#E63946';  // Vermelho (cor de destaque)
const successColor = '#2A9D8F'; // Verde (para sucesso/conclusão)
const warningColor = '#E9C46A'; // Amarelo (para avisos)

// Cores de faixas de jiu-jitsu
export const BeltColors = {
  white: '#F5F5F5',
  blue: '#0077B6',
  purple: '#7209B7',
  brown: '#774936',
  black: '#0B090A',
};

export const Colors = {
  light: {
    text: '#1E2A38',
    background: '#F8F9FA',
    tint: accentColor,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: accentColor,
    primary: primaryColor,
    accent: accentColor,
    success: successColor,
    warning: warningColor,
    card: '#FFFFFF',
    border: '#E9ECEF',
  },
  dark: {
    text: '#F8F9FA',
    background: '#121212',
    tint: accentColor,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: accentColor,
    primary: primaryColor,
    accent: accentColor,
    success: successColor,
    warning: warningColor,
    card: '#1E1E1E',
    border: '#2C2C2C',
  },
};
