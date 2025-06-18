import {
  Accordion as BaseAccordion,
  AccordionItem as BaseAccordionItem,
  AccordionTrigger as BaseAccordionTrigger,
  AccordionContent as BaseAccordionContent,
} from "@/components/ui/accordion";

export const GoldAccordion = BaseAccordion;
export const GoldAccordionItem = BaseAccordionItem;
export const GoldAccordionTrigger = (props: any) => (
  <BaseAccordionTrigger
    {...props}
    className={`bg-[#181c23] text-[#CFB53B] border-b border-[#22242a] hover:bg-[#232733] transition-colors ${props.className || ""}`}
  />
);
export const GoldAccordionContent = (props: any) => (
  <BaseAccordionContent
    {...props}
    className={`bg-[#232733] text-white border-b border-[#22242a] ${props.className || ""}`}
  />
); 