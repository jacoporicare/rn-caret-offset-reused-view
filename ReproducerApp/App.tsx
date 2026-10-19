/**
 * Reproducer: on iOS (Fabric), a single-line TextInput draws its caret and
 * typed text above its vertical centre while focused, when its native view was
 * last used by a large-font TextInput that was given a value.
 *
 * Tap 1, 2 and 3 in order, then type into the field step 3 shows. Step 2's
 * 32 pt field reuses the native view that step 1's 17 pt field left in the
 * recycle pool. Its value is written while that view still has the 17 pt
 * field's 42 pt frame, and React Native's caret restore scrolls the UIKit field
 * editor 4.67 pt down to reach the 32 pt caret, although nobody is editing the
 * field. Step 3's field reuses the same view and keeps that offset: while
 * focused, its caret and typed text sit above the red centre line. The
 * reference field at the top was mounted fresh and stays centred when focused.
 *
 * @format
 */

import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

type Step = 'none' | 'field' | 'price' | 'reused';

function SingleLineField({ autoFocus }: { autoFocus?: boolean }) {
  return (
    <View style={styles.field}>
      <TextInput
        style={styles.singleLine}
        autoFocus={autoFocus}
        placeholder="Type here"
      />
      <View pointerEvents="none" style={styles.centreLine} />
    </View>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('none');

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.label}>Reference, mounted once:</Text>
      <SingleLineField />

      <View style={styles.buttons}>
        <Button
          title="1. Mount a 17 pt field"
          onPress={() => setStep('field')}
        />
        <Button
          title="2. Replace it with a 32 pt value"
          onPress={() => setStep('price')}
        />
        <Button
          title="3. Replace that with a 17 pt field"
          onPress={() => setStep('reused')}
        />
      </View>

      {step === 'field' && (
        <>
          <Text style={styles.label}>17 pt field:</Text>
          <SingleLineField key="field" />
        </>
      )}
      {step === 'price' && (
        <>
          <Text style={styles.label}>32 pt value, never focused:</Text>
          <TextInput key="price" value="2 000 Kč" style={styles.price} />
        </>
      )}
      {step === 'reused' && (
        <>
          <Text style={styles.label}>17 pt field, reuses the same view:</Text>
          <SingleLineField key="reused" autoFocus />
        </>
      )}
    </View>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 13,
    color: '#666',
  },
  field: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  singleLine: {
    height: 42,
    paddingHorizontal: 16,
    fontSize: 17,
  },
  centreLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 20.5,
    height: 1,
    backgroundColor: 'red',
  },
  buttons: {
    gap: 4,
  },
  price: {
    height: 40,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
});

export default App;
