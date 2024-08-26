import { 
    createTheme, defaultTheme, defaultDarkModeOverride
  } from '@aws-amplify/ui-react';

type BreakpointKey = 'base' | 'small' | 'medium' | 'large' | 'xl' | 'xxl';

export interface Breakpoints {
  values: Record<BreakpointKey, number>;
  defaultBreakpoint: BreakpointKey;
}

// Breakpoint unit is in pixels
export const breakpoints: Breakpoints = {
  values: {
    base: 0,
    small: 480, // breakpoint unit is px
    medium: 768,
    large: 992,
    xl: 1280,
    xxl: 1536,
  },
  defaultBreakpoint: 'base',
};

export const theme = createTheme({
    tokens: {
      colors: {
        brand: {
          primary: defaultTheme.primaryColor ?? 'blue'
        },
      },
    },
    // customize the breakpoints
    breakpoints: breakpoints,
    // customize overrides like dark mode or responsive theming
    overrides: [defaultDarkModeOverride]
  } as any);
