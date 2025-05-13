import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type AccordionRootProps = React.ComponentPropsWithoutRef<
	typeof AccordionPrimitive.Root
>;

interface AccordionProps extends Omit<AccordionRootProps, "type"> {
	type?: "single" | "multiple";
	defaultValue?: string | string[];
	value?: string | string[];
	onValueChange?: (value: string | string[]) => void;
	className?: string;
	children?: React.ReactNode;
}

interface AccordionItemProps
	extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
	value: string;
	className?: string;
	children?: React.ReactNode;
}

interface AccordionTriggerProps
	extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
	className?: string;
	children?: React.ReactNode;
}

interface AccordionContentProps
	extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {
	className?: string;
	children?: React.ReactNode;
}

/**
 * Accordion Component
 * Used to display collapsible content sections
 */
const Accordion = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Root>,
	AccordionProps
>(({ className, type = "single", ...props }, ref) => (
	<AccordionPrimitive.Root
		ref={ref}
		type={type}
		className={cn("", className)}
		{...props}
	/>
));
Accordion.displayName = "Accordion";

/**
 * Accordion Item Component
 * Individual collapsible section within the accordion
 */
const AccordionItem = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Item>,
	AccordionItemProps
>(({ className, ...props }, ref) => (
	<AccordionPrimitive.Item
		ref={ref}
		className={cn("border-b", className)}
		{...props}
	/>
));
AccordionItem.displayName = "AccordionItem";

/**
 * Accordion Trigger Component
 * Button that toggles the visibility of accordion content
 */
const AccordionTrigger = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Trigger>,
	AccordionTriggerProps
>(({ className, children, ...props }, ref) => (
	<AccordionPrimitive.Header className="flex">
		<AccordionPrimitive.Trigger
			ref={ref}
			className={cn(
				"flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
				className,
			)}
			{...props}
		>
			{children}
			<ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
		</AccordionPrimitive.Trigger>
	</AccordionPrimitive.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

/**
 * Accordion Content Component
 * Content section that shows/hides based on trigger state
 */
const AccordionContent = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Content>,
	AccordionContentProps
>(({ className, children, ...props }, ref) => (
	<AccordionPrimitive.Content
		ref={ref}
		className={cn(
			"overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
			className,
		)}
		{...props}
	>
		<div className="pb-4 pt-0">{children}</div>
	</AccordionPrimitive.Content>
));
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
