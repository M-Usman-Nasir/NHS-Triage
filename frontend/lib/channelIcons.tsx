import type { LucideIcon } from 'lucide-react';
import { Mail, MessageSquare, Phone, Smartphone, StickyNote } from 'lucide-react';

export const CHANNEL_ICON: Record<string, LucideIcon> = {
  email: Mail,
  sms: Smartphone,
  note: StickyNote,
  phone: Phone,
};

export function ChannelIcon({ channel, className }: { channel: string; className?: string }) {
  const Icon = CHANNEL_ICON[channel] || MessageSquare;
  return <Icon className={className} strokeWidth={1.75} aria-hidden />;
}
