import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { WaterSplash } from '@/components/shared/WaterSplash';
import { useLogContact } from '@/hooks/useLogContact';

interface WaterButtonProps {
  friendId: string;
}

export function WaterButton({ friendId }: WaterButtonProps) {
  const { logContact } = useLogContact();
  const [splashKey, setSplashKey] = useState(0);

  const handlePress = async () => {
    await logContact(friendId, 'outbound');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSplashKey((key) => key + 1);
  };

  return (
    <Pressable onPress={handlePress} style={[styles.button, styles.water]}>
      <WaterSplash triggerKey={splashKey} color="#B8E3D1" />
      <ThemedText type="smallBold">Water</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  water: {
    backgroundColor: '#7CB342',
  },
});
