// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'magnifyingglass': 'search',
  'staroflife.fill': 'star',
  'calendar': 'calendar-today',
  'checkmark': 'check',
  'xmark': 'close',
  'checkmark.circle': 'check-circle',
  'person.2.fill': 'group',
  'book.fill': 'book',
  'figure.martial.arts': 'sports-martial-arts',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'person.fill': 'person',
  'arrow.right': 'arrow-forward',
  'rectangle.portrait.and.arrow.right': 'logout',
  'play.circle.fill': 'play-circle-filled',
  'play.fill': 'play-arrow',
  'clock.fill': 'schedule',
  'tag.fill': 'local-offer',
  'star.fill': 'star',
  'eye.circle.fill': 'visibility',
  'arrow.right.circle.fill': 'arrow-forward',
  'plus': 'add',
  'trash': 'delete',
  'chevron.up': 'keyboard-arrow-up',
  'chevron.down': 'keyboard-arrow-down',
  'chevron.left': 'chevron-left',
  'person.3.fill': 'group',
  'chart.bar.fill': 'bar-chart',
  'pencil': 'edit',
  'pause.fill': 'pause',
  'trash.fill': 'delete',
  'eye.slash.fill': 'visibility-off',
  'eye.fill': 'visibility',
  'envelope.fill': 'email',
  'lock.fill': 'lock',
  'creditcard.fill': 'credit-card',
  'person.badge.key.fill': 'admin-panel-settings',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
