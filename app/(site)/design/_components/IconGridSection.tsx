import { Icon } from "@/components/ui/Icon";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ExternalLink,
  Heart,
  Mail,
  MapPin,
  Menu,
  Phone,
  X,
} from "@/components/ui/icons";
import { SectionShell } from "./SectionShell";

const grid = [
  { name: "ArrowRight", icon: ArrowRight, role: "Tertiary buttons, lists" },
  { name: "ChevronDown", icon: ChevronDown, role: "Select, accordions" },
  { name: "Menu", icon: Menu, role: "Mobile nav hamburger" },
  { name: "X", icon: X, role: "Close, dismiss" },
  { name: "Check", icon: Check, role: "Success state" },
  { name: "AlertCircle", icon: AlertCircle, role: "Errors, warnings" },
  { name: "Mail", icon: Mail, role: "Email contact" },
  { name: "Phone", icon: Phone, role: "Phone contact" },
  { name: "MapPin", icon: MapPin, role: "Address" },
  { name: "Calendar", icon: Calendar, role: "Dates on blog and activities" },
  { name: "Heart", icon: Heart, role: "Donate affinity" },
  { name: "ExternalLink", icon: ExternalLink, role: "Outbound links" },
];

export function IconGridSection() {
  return (
    <SectionShell
      id="icons"
      number="§11"
      label="Icons"
      meta={[
        { key: "count", value: "12" },
        { key: "family", value: "lucide" },
        { key: "stroke", value: "1.75" },
      ]}
    >
      <p className="max-w-2xl text-body text-ink-2">
        Lucide React, default 20px / stroke 1.75. Inherits text color. Decorative icons set{" "}
        <code className="font-mono">aria-hidden</code>; informational icons take a label for the
        screen reader. Brand marks ship inline in Footer.
      </p>
      <div className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {grid.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center gap-4 border-t border-hairline py-4 first:border-t-0 sm:nth-[2]:border-t-0 lg:nth-[3]:border-t-0"
          >
            <Icon icon={entry.icon} label={entry.name} className="text-accent" />
            <div>
              <p className="font-mono text-meta uppercase text-ink">{entry.name}</p>
              <p className="font-mono text-meta uppercase text-ink-2">{entry.role}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
