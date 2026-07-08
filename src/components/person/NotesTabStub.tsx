import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export function NotesTabStub() {
  return (
    <View style={styles.container}>
      <ThemedText type="default" themeColor="textSecondary">
        Notes are coming soon.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
});
