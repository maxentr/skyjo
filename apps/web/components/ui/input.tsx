import * as React from "react"

import { cn } from "@/lib/utils"
import { VariantProps, cva } from "class-variance-authority"

const buttonVariants = cva(
  "flex w-full rounded-md border-2 border-black bg-off-white px-3 py-2 text-sm  file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-black/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 focus-visible:outline-black focus-visible:-outline-offset-4",
  {
    variants: {
      size: {
        small: " h-8 ",
        default: "h-10",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof buttonVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ size, className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(buttonVariants({ size }), className)}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
