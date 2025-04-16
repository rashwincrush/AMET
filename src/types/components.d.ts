// Type declarations for UI components
declare module '@/components/ui/calendar' {
  import { DayPicker } from 'react-day-picker';
  export type CalendarProps = React.ComponentProps<typeof DayPicker>;
  export const Calendar: React.FC<CalendarProps>;
}

declare module '@/hooks/use-toast' {
  interface ToastProps {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
    duration?: number;
  }
  export const toast: (props: ToastProps) => void;
} 