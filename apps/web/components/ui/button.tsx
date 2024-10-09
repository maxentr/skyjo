import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap bg-button border-2 border-black text font-normal transition-all duration-200 focus-visible:outline-black focus-visible:-outline-offset-4 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        small:
          " rounded border-[1.5px] border-black h-6 px-4 shadow-[3px_3px_0px_0px_rgba(0,0,0)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0)]",
        default:
          "rounded-md h-10 px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0)]",
        outline: "rounded-md h-10 w-fit px-4 py-2 bg-white",
        icon: "rounded-md h-10 w-10 p-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  children?: React.ReactNode
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      asChild = false,
      loading = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, className }))}
        ref={ref}
        disabled={loading || disabled}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center bg-button rounded-md">
            <Loader2Icon className="h-5 w-5 animate-spin" />
          </span>
        )}
        {children}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
