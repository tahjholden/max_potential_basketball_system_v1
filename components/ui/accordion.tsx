import * as React from "react";
import * as RadixAccordion from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";

export const Accordion = RadixAccordion.Root;
export const AccordionItem = RadixAccordion.Item;
export const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixAccordion.Header>
    <RadixAccordion.Trigger
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between py-3 px-4 text-lg font-semibold bg-[#181c23] text-yellow-400 border-b border-[#22242a] hover:bg-[#232733] transition-colors",
        className
      )}
      {...props}
    >
      {children}
      <span className="ml-2 transition-transform data-[state=open]:rotate-90">▸</span>
    </RadixAccordion.Trigger>
  </RadixAccordion.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Content>
>(({ className, children, ...props }, ref) => (
  <RadixAccordion.Content
    ref={ref}
    className={cn(
      "px-4 py-3 bg-[#232733] text-white border-b border-[#22242a] data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    {children}
  </RadixAccordion.Content>
));
AccordionContent.displayName = "AccordionContent"; 