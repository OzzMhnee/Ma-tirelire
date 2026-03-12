import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, StyleSheet, View } from 'react-native';

import { Assets } from '@config/assets';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ITEMS = new Array(8).fill(null);
const LAYER_WIDTH = SCREEN_WIDTH * ITEMS.length;

type LayerProps = {
  source: any;
  factor: number;
  durationMs?: number;
  infinite?: boolean;
  translateX: Animated.Value;
};

function Layer({ source, factor, durationMs = 24000, infinite = false, translateX }: LayerProps) {
  const loopAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!infinite) return;
    let mounted = true;

    const run = () => {
      loopAnim.setValue(0);
      Animated.timing(loopAnim, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && mounted) run();
      });
    };

    run();

    return () => {
      mounted = false;
      loopAnim.stopAnimation();
    };
  }, [durationMs, infinite, loopAnim]);

  const computedTranslate = infinite
    ? Animated.multiply(Animated.modulo(Animated.multiply(loopAnim, LAYER_WIDTH), LAYER_WIDTH), -1)
    : Animated.multiply(translateX, factor);

  return (
    <View pointerEvents="none" style={styles.layer}>
      <Animated.View style={[styles.slider, { width: LAYER_WIDTH, transform: [{ translateX: computedTranslate }] }]}> 
        {ITEMS.map((_, index) => (
          <Image
            key={`${factor}-${index}`}
            source={source}
            resizeMode="cover"
            style={[styles.image, { left: SCREEN_WIDTH * index }]}
          />
        ))}
      </Animated.View>
    </View>
  );
}

export function ParallaxBackground() {
  const translateX = useRef(new Animated.Value(0)).current;

  return (
    <>
      <Layer source={Assets.backgrounds.bg4} factor={0} translateX={translateX} />
      <Layer source={Assets.backgrounds.bg3} factor={0.5} translateX={translateX} infinite durationMs={26000} />
      <Layer source={Assets.backgrounds.bg2} factor={0.15} translateX={translateX} />
      <Layer source={Assets.backgrounds.bg1} factor={0.2} translateX={translateX} infinite durationMs={50000} />
      <View pointerEvents="none" style={styles.overlay} />
    </>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  slider: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    flexDirection: 'row',
  },
  image: {
    position: 'absolute',
    top: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
});