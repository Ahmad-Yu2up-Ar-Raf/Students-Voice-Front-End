import * as React from 'react';
import Svg, { SvgProps, G, Path } from 'react-native-svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
  primary?: string;
  background?: string;
}
const MessageIcon = ({ title, titleId, ...props }: SvgProps & SVGRProps) => (
  <Svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    width={25}
    height={25}
    aria-labelledby={titleId}
    {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <G strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <Path d="m7.4 6.32 8.49-2.83c3.81-1.27 5.88.81 4.62 4.62l-2.83 8.49c-1.9 5.71-5.02 5.71-6.92 0l-.84-2.52-2.52-.84c-5.71-1.9-5.71-5.01 0-6.92Z" />
      <Path d="m10.11 13.65 3.58-3.59" />
    </G>
  </Svg>
);
export default MessageIcon;
