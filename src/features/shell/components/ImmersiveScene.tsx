import React from 'react';
import { ScrollView, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { ScenicBackdrop } from './PFVisual';

export function ImmersiveScene({
  background,
  children,
  scroll = true,
  contentStyle,
}: {
  background: ImageSourcePropType;
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  if (!scroll) {
    return (
      <ScenicBackdrop source={background} overlay="soft">
        <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>
      </ScenicBackdrop>
    );
  }

  return (
    <ScenicBackdrop source={background} overlay="soft">
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </ScenicBackdrop>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { minHeight: '100%', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 96 },
});
