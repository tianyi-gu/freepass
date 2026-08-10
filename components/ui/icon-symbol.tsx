// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
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
  'chevron.left': 'chevron-left',
  'chevron.down': 'expand-more',
  'chevron.up': 'expand-less',
  'bubble.left.and.bubble.right.fill': 'chat',
  'play.rectangle.fill': 'play-circle',
  'calendar': 'event',
  'rectangle.stack.fill': 'folder',
  'questionmark.circle.fill': 'help',
  'gearshape.fill': 'settings',
  'square.and.pencil': 'edit',
  'star.fill': 'star',
  'hand.thumbsup.fill': 'thumb-up',
  'ellipsis': 'more-vert',
  'plus': 'add',
  'xmark': 'close',
  'doc.text.fill': 'description',
  'globe': 'language',
  'phone.fill': 'phone',
  'envelope.fill': 'email',
  'map.fill': 'place',
  'magnifyingglass': 'search',
  'line.3.horizontal': 'menu',
  'person.fill': 'person',
  'rectangle.grid.2x2.fill': 'dashboard',
  'book.fill': 'menu-book',
  'arrow.up.right': 'arrow-forward',
  'heart': 'favorite-border',
  'heart.fill': 'favorite',
  'info.circle': 'info',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'building.2.fill': 'business',
  'mic.fill': 'mic',
  'speaker.wave.2.fill': 'volume-up',
  'speaker.slash.fill': 'volume-off',
  'stop.fill': 'stop',
  'person.fill.viewfinder': 'record-voice-over',
  'sparkles': 'auto-awesome',
  'camera.fill': 'photo-camera',
  'photo.fill': 'photo-library',
  'pencil': 'edit',
  'trash.fill': 'delete',
  'exclamationmark.triangle.fill': 'warning',
  'chart.bar.fill': 'bar-chart',
  'fork.knife': 'restaurant',
  'car.fill': 'directions-car',
  'bolt.fill': 'bolt',
  'ellipsis.circle.fill': 'more-horiz',
  'square.and.arrow.up': 'ios-share',
  'location.fill': 'place',
  'location.slash.fill': 'location-off',
  'arrow.triangle.turn.up.right.circle.fill': 'directions',
  'checkmark.circle.fill': 'check-circle',
  'checkmark.seal.fill': 'verified',
  'exclamationmark.circle': 'error-outline',
  'hand.wave.fill': 'waving-hand',
  'list.bullet': 'format-list-bulleted',
  'square.grid.2x2.fill': 'grid-view',
  'doc.fill': 'insert-drive-file',
  'person.text.rectangle': 'badge',
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
