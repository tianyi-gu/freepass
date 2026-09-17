import { Pressable, Text, View } from 'react-native';
import { FreepassColors } from '@/constants/theme';

export function LoadError({ label = 'This information', onRetry }: { label?: string; onRetry?: () => void }) {
  return <View accessibilityRole="alert" style={{ padding: 16, backgroundColor: FreepassColors.white, borderRadius: 8 }}>
    <Text style={{ color: FreepassColors.text }}>{label} could not be loaded. Please check your connection and try again.</Text>
    {onRetry && <Pressable accessibilityRole="button" accessibilityLabel={`Retry loading ${label.toLowerCase()}`} onPress={onRetry} style={{ paddingVertical: 12 }}><Text style={{ color: FreepassColors.accent, fontWeight: '700' }}>Retry</Text></Pressable>}
  </View>;
}
