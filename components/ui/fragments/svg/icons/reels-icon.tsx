import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { SvgProps, G, Path } from 'react-native-svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
  backgroundColor?: string;
}
const ReelsIcon = ({ title, titleId, ...props }: SvgProps & SVGRProps) => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      aria-labelledby={titleId}
      {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <G stroke={props.stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <Path d="M9 22h6c5 0 7-2 7-7V9c0-5-2-7-7-7H9C4 2 2 4 2 9v6c0 5 2 7 7 7Z" />
        <Path
          fill={props.backgroundColor}
          strokeMiterlimit={10}
          d="M9.1 12v-1.48c0-1.91 1.35-2.68 3-1.73l1.28.74 1.28.74c1.65.95 1.65 2.51 0 3.46l-1.28.74-1.28.74c-1.65.95-3 .17-3-1.73V12Z"
        />
      </G>
    </Svg>
  );
};
export default ReelsIcon;
