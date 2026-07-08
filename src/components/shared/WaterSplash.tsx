import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface WaterSplashProps {
  /** Increment this to replay the splash. 0 renders nothing. */
  triggerKey: number;
  color?: string;
}

interface DropletProps {
  triggerKey: number;
  color: string;
  delayMs: number;
  driftX: number;
}

function Droplet({ triggerKey, color, delayMs, driftX }: DropletProps) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.4);

  useEffect(() => {
    if (triggerKey === 0) return;
    translateY.value = 0;
    translateX.value = 0;
    opacity.value = 0;
    scale.value = 0.4;

    translateY.value = withDelay(delayMs, withTiming(-26, { duration: 380, easing: Easing.out(Easing.quad) }));
    translateX.value = withDelay(delayMs, withTiming(driftX, { duration: 380, easing: Easing.out(Easing.quad) }));
    scale.value = withDelay(delayMs, withTiming(1, { duration: 200 }));
    opacity.value = withDelay(
      delayMs,
      withSequence(withTiming(0.85, { duration: 60 }), withTiming(0, { duration: 260 })),
    );
  }, [triggerKey, delayMs, driftX, translateY, translateX, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.droplet, { backgroundColor: color }, animatedStyle]}
    />
  );
}

export function WaterSplash({ triggerKey, color = '#4FC3F7' }: WaterSplashProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (triggerKey === 0) return;
    scale.value = 0;
    opacity.value = 0.6;
    scale.value = withTiming(1.6, { duration: 420, easing: Easing.out(Easing.quad) });
    opacity.value = withSequence(withTiming(0.6, { duration: 40 }), withTiming(0, { duration: 380 }));
  }, [triggerKey, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.circle, { backgroundColor: color }, animatedStyle]}
      />
      <Droplet triggerKey={triggerKey} color={color} delayMs={0} driftX={-14} />
      <Droplet triggerKey={triggerKey} color={color} delayMs={50} driftX={0} />
      <Droplet triggerKey={triggerKey} color={color} delayMs={100} driftX={14} />
    </>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderRadius: 999,
  },
  droplet: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 8,
    height: 8,
    marginLeft: -4,
    marginTop: -4,
    borderRadius: 4,
  },
});
