import type { CSSProperties, HTMLAttributes } from 'react';

type SkeletonVariant = 'text' | 'rounded';

type SkeletonProps = HTMLAttributes<HTMLSpanElement> & {
  height?: number | string;
  style?: CSSProperties;
  variant?: SkeletonVariant;
  width?: number | string;
};

export function Skeleton({
  className,
  height,
  style,
  variant = 'text',
  width,
  ...rest
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={className}
      data-skeleton=""
      style={{
        borderRadius: variant === 'rounded' ? '8px' : '4px',
        height: height ?? (variant === 'text' ? '1.2em' : 'auto'),
        ...(width !== undefined ? { width } : {}),
        ...style,
      }}
      {...rest}
    />
  );
}
