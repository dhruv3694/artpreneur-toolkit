import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:scale-[1.02]",
        destructive: "bg-destructive text-destructive-foreground shadow-card hover:shadow-card-hover hover:-translate-y-1",
        outline: "border-2 border-border bg-card/60 backdrop-blur-sm text-foreground hover:bg-card hover:border-primary/40 hover:-translate-y-1 hover:shadow-soft",
        secondary: "bg-gradient-secondary text-secondary-foreground shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:scale-[1.02]",
        ghost: "hover:bg-muted/50 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "glass shadow-glass text-foreground hover:shadow-card hover:-translate-y-1",
      },
      size: {
        default: "h-12 px-7 py-3",
        sm: "h-10 rounded-lg px-5 text-xs",
        lg: "h-14 rounded-xl px-12 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
