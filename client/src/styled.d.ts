import 'styled-components';
import type { AppTheme } from './theme';

// Makes props.theme strongly typed everywhere — no implicit any in styled blocks.
declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends AppTheme {}
}
