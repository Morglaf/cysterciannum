import { SvgIcon, SvgIconProps } from '@mui/material';

const MonkIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c3.31 0 6 2.69 6 6 0 1.66-.67 3.16-1.76 4.24l-.71.71C14.53 15.95 13.35 16.5 12 16.5s-2.53-.55-3.53-1.55l-.71-.71C6.67 13.16 6 11.66 6 10c0-3.31 2.69-6 6-6zm0 1c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 13c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </SvgIcon>
);

export default MonkIcon; 