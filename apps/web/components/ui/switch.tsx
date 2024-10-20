"use client"

import * as SwitchPrimitives from "@radix-ui/react-switch"
import * as React from "react"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-[1.5px] border-black dark:border-dark-border transition-all duration-200 -outline-offset-2 focus-visible:outline focus-visible:outline-black focus-visible:outline-2 focus-visible:outline-offset-[-6px] dark:focus-visible:data-[state=checked]:outline-dark-input dark:focus-visible:data-[state=unchecked]:outline-dark-border disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-button dark:data-[state=checked]:bg-dark-border data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-dark-input  ",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-6 w-6 rounded-full bg-white dark:bg-dark-input border-[1.5px] border-black dark:border-dark-border transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:-translate-x-1",
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
