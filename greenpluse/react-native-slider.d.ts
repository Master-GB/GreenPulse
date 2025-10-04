declare module 'react-native-slider' {
  import { Component } from 'react';
  import { ViewStyle, StyleProp } from 'react-native';

  interface SliderProps {
    value?: number;
    minimumValue?: number;
    maximumValue?: number;
    step?: number;
    minimumTrackTintColor?: string;
    maximumTrackTintColor?: string;
    thumbTintColor?: string;
    thumbTouchSize?: { width: number; height: number };
    onValueChange?: (value: number) => void;
    onSlidingStart?: (value: number) => void;
    onSlidingComplete?: (value: number) => void;
    style?: StyleProp<ViewStyle>;
    trackStyle?: StyleProp<ViewStyle>;
    thumbStyle?: StyleProp<ViewStyle>;
    disabled?: boolean;
    debugTouchArea?: boolean;
  }

  export default class Slider extends Component<SliderProps> {}
}