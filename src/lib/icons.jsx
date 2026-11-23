import {
  Leaf, UtensilsCrossed, ShieldCheck, HardHat, Construction, Zap, Flame, Warehouse, Gauge, Droplets, Building2,
  ClipboardCheck, BadgeCheck, GraduationCap, Factory, Landmark, Briefcase, Users, Workflow, Globe2, Award,
  FileCheck2, Search, Scale, Lock, Lightbulb, Target, Eye, Recycle,
} from 'lucide-react';

/** Icons that can be chosen by name from the admin (service.icon, industry.icon) */
export const ICONS = {
  Leaf, UtensilsCrossed, ShieldCheck, HardHat, Construction, Zap, Flame, Warehouse, Gauge, Droplets, Building2,
  ClipboardCheck, BadgeCheck, GraduationCap, Factory, Landmark, Briefcase, Users, Workflow, Globe2, Award,
  FileCheck2, Search, Scale, Lock, Lightbulb, Target, Eye, Recycle,
};
export const ICON_NAMES = Object.keys(ICONS);

export function Icon({ name, size = 22, strokeWidth = 1.6, ...rest }) {
  const C = ICONS[name] || ShieldCheck;
  return <C size={size} strokeWidth={strokeWidth} aria-hidden="true" {...rest} />;
}
