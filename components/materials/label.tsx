import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva(
	"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

interface LabelProps
	extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
		VariantProps<typeof labelVariants> {
	required?: boolean;
	error?: string;
}

/**
 * Label Component
 * A form label with support for required state and error messages
 */
const Label = React.forwardRef<
	React.ElementRef<typeof LabelPrimitive.Root>,
	LabelProps
>(({ className, required, error, children, ...props }, ref) => (
	<div className="space-y-1">
		<LabelPrimitive.Root
			ref={ref}
			className={cn(labelVariants(), className)}
			{...props}
		>
			{children}
			{required && <span className="text-destructive ml-1">*</span>}
		</LabelPrimitive.Root>
		{error && <p className="text-sm text-destructive">{error}</p>}
	</div>
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
