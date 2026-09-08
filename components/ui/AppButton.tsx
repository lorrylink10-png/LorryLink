import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "accent" | "outline" | "ghost" | "danger";
type ButtonSize = "md" | "sm";

type SharedButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = SharedButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = SharedButtonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

type AppButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_10px_24px_rgb(37_99_235_/_24%)] hover:bg-blue-700",
  secondary: "bg-[var(--brand-navy)] text-white hover:bg-[#17385f]",
  accent: "border border-[var(--accent)] bg-[var(--accent)] text-white shadow-[0_10px_24px_rgb(249_115_22_/_24%)] hover:border-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-white",
  outline: "border border-[var(--border)] bg-white text-[var(--brand-navy)] hover:border-[var(--brand-blue)]",
  ghost: "bg-transparent text-[var(--brand-blue)] hover:bg-blue-50",
  danger: "bg-[var(--danger)] text-white hover:bg-red-700",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 py-3 text-sm",
  sm: "min-h-10 px-4 py-2 text-sm",
};

function isLinkButton(props: AppButtonProps): props is ButtonAsLink {
  return typeof props.href === "string";
}

export function AppButton(props: AppButtonProps) {
  const { variant = "primary", size = "md", className, children } = props;

  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-blue)] disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  if (isLinkButton(props)) {
    const { href, variant: _variant, size: _size, className: _className, children: _children, ...linkProps } = props;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { variant: _variant, size: _size, className: _className, children: _children, ...buttonProps } = props;

  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
