import 'react';

type ViewTransitionClass =
  | string
  | {
      default?: string;
      [transitionType: string]: string | undefined;
    };

declare module 'react' {
  interface ViewTransitionProps {
    children: ReactNode;
    name?: string;
    default?: ViewTransitionClass;
    enter?: ViewTransitionClass;
    exit?: ViewTransitionClass;
    share?: ViewTransitionClass;
    update?: ViewTransitionClass;
  }

  const ViewTransition: ExoticComponent<ViewTransitionProps>;
}
