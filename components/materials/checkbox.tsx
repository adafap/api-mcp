import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps
	extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
	label?: React.ReactNode;
	description?: React.ReactNode;
	error?: string;
}

/**
 * Checkbox Component
 * A form control that allows users to select multiple options from a set
 */
const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	CheckboxProps
>(({ className, label, description, error, ...props }, ref) => (
	<div className="flex items-start space-x-2">
		<CheckboxPrimitive.Root
			ref={ref}
			className={cn(
				"peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
				error && "border-destructive",
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				className={cn("flex items-center justify-center text-current")}
			>
				<Check className="h-4 w-4" />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
		{(label || description) && (
			<div className="grid gap-1.5 leading-none">
				{label && (
					<label
						htmlFor={props.id}
						className={cn(
							"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
							error && "text-destructive",
						)}
					>
						{label}
					</label>
				)}
				{description && (
					<p className="text-sm text-muted-foreground">{description}</p>
				)}
				{error && <p className="text-sm text-destructive">{error}</p>}
			</div>
		)}
	</div>
));
Checkbox.displayName = "Checkbox";

export { Checkbox };
