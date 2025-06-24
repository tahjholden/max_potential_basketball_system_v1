import {
  Accordion as BaseAccordion,
  AccordionItem as BaseAccordionItem,
} from "@/components/ui/accordion";

export const GoldAccordion = BaseAccordion;
export const GoldAccordionItem = BaseAccordionItem;

// Since the base accordion doesn't have separate trigger/content components,
// we'll create wrapper components that use the base accordion
export const GoldAccordionTrigger = ({ children, ...props }: any) => (
  <div
    {...props}
    className={`bg-[#181c23] text-gold border-b border-[#22242a] hover:bg-[#232733] transition-colors px-6 py-4 ${props.className || ""}`}
  >
    {children}
  </div>
);

export const GoldAccordionContent = ({ children, ...props }: any) => (
  <div
    {...props}
    className={`bg-[#232733] text-white border-b border-[#22242a] px-6 py-4 ${props.className || ""}`}
  >
    {children}
  </div>
); 