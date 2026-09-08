import {
  BriefcaseBusiness,
  Home,
  Map,
  Package,
  Plus,
  Search,
  Truck,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  prominent?: boolean;
};

export const customerNavItems: NavItem[] = [
  { label: "Home", href: "/customer/home", icon: Home },
  { label: "Orders", href: "/customer/orders", icon: Package },
  { label: "Create", href: "/customer/create", icon: Plus, prominent: true },
  { label: "Tracking", href: "/customer/tracking", icon: Map },
  { label: "Profile", href: "/customer/profile", icon: User },
];

export const driverNavItems: NavItem[] = [
  { label: "Discover", href: "/driver/discover", icon: Search },
  { label: "My Jobs", href: "/driver/jobs", icon: BriefcaseBusiness },
  { label: "Tracking", href: "/driver/tracking", icon: Truck },
  { label: "Profile", href: "/driver/profile", icon: User },
];
