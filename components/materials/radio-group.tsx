import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RadioGroupProps
	extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
	options?: Array<{
		label: React.ReactNode;
		value: string;
		description?: React.ReactNode;
		disabled?: boolean;
	}>;
	error?: string;
	direction?: "horizontal" | "vertical";
}

interface RadioGroupItemProps
	extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
	label?: React.ReactNode;
	description?: React.ReactNode;
}

/**
 * Radio Group Component
 * A set of radio buttons for selecting a single option from a list
 */
const RadioGroup = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Root>,
	RadioGroupProps
>(({ className, options, error, direction = "vertical", ...props }, ref) => {
	return (
		<div className="space-y-2">
			<RadioGroupPrimitive.Root
				ref={ref}
				className={cn(
					"grid gap-2",
					direction === "horizontal" && "grid-flow-col auto-cols-max",
					className,
				)}
				{...props}
			>
				{options?.map((option) => (
					<div key={option.value} className="flex items-start space-x-3">
						<RadioGroupPrimitive.Item
							value={option.value}
							disabled={option.disabled}
							className={cn(
								"aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
								error && "border-destructive",
							)}
						>
							<RadioGroupPrimitive.Indicator className="flex items-center justify-center">
								<Circle className="h-2.5 w-2.5 fill-current text-current" />
							</RadioGroupPrimitive.Indicator>
						</RadioGroupPrimitive.Item>
						<div className="grid gap-1">
							<label
								htmlFor={option.value}
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								{option.label}
							</label>
							{option.description && (
								<p className="text-sm text-muted-foreground">
									{option.description}
								</p>
							)}
						</div>
					</div>
				))}
			</RadioGroupPrimitive.Root>
			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

/**
 * Radio Group Item Component
 * Individual radio button within a radio group
 */
const RadioGroupItem = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Item>,
	RadioGroupItemProps
>(({ className, label, description, ...props }, ref) => {
	return (
		<div className="flex items-start space-x-3">
			<RadioGroupPrimitive.Item
				ref={ref}
				className={cn(
					"aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				{...props}
			>
				<RadioGroupPrimitive.Indicator className="flex items-center justify-center">
					<Circle className="h-2.5 w-2.5 fill-current text-current" />
				</RadioGroupPrimitive.Indicator>
			</RadioGroupPrimitive.Item>
			{(label || description) && (
				<div className="grid gap-1">
					{label && (
						<label
							htmlFor={props.id}
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							{label}
						</label>
					)}
					{description && (
						<p className="text-sm text-muted-foreground">{description}</p>
					)}
				</div>
			)}
		</div>
	);
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
