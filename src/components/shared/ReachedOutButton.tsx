import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { WaterSplash } from '@/components/shared/WaterSplash';
import { useLogContact } from '@/hooks/useLogContact';

interface ReachedOutButtonProps {
  friendId: string;
}

export function ReachedOutButton({ friendId }: ReachedOutButtonProps) {
  const { logContact } = useLogContact();
  const [splashKey, setSplashKey] = useState(0);

  const handlePress = async () => {
    await logContact(friendId, 'inbound');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSplashKey((key) => key + 1);
  };

  return (
    <Pressable onPress={handlePress} style={[styles.button, styles.reachedOut]}>
      <WaterSplash triggerKey={splashKey} color="#FFE0A3" />
      <ThemedText type="smallBold">They reached out</ThemedText>
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
  reachedOut: {
    backgroundColor: '#F4B942',
  },
});
