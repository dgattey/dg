import type { ExoticComponent, ReactNode } from 'react';

type ViewTransitionClass =
  | 'none'
  | 'auto'
  | (string & {})
  | Record<string, 'none' | 'auto' | string>;

declare module 'react' {
  interface ViewTransitionProps {
    children?: ReactNode;
    default?: ViewTransitionClass;
    enter?: ViewTransitionClass;
    exit?: ViewTransitionClass;
    name?: string;
    share?: ViewTransitionClass;
    update?: ViewTransitionClass;
  }

  const ViewTransition: ExoticComponent<ViewTransitionProps>;
  function addTransitionType(type: string): void;
}
