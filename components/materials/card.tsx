import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
	hoverable?: boolean;
	bordered?: boolean;
	loading?: boolean;
	className?: string;
	children?: React.ReactNode;
	style?: React.CSSProperties;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
}

interface CardHeaderProps {
	title?: React.ReactNode;
	subtitle?: React.ReactNode;
	extra?: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}

interface CardFooterProps {
	className?: string;
	children?: React.ReactNode;
	style?: React.CSSProperties;
}

/**
 * Card Component
 * A container for content with optional header and footer
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
	(
		{ className, hoverable, bordered = true, loading, children, ...props },
		ref,
	) => {
		return (
			<div
				ref={ref}
				className={cn(
					"rounded-lg bg-card text-card-foreground",
					bordered && "border",
					hoverable && "transition-shadow hover:shadow-lg",
					className,
				)}
				{...props}
			>
				{loading ? (
					<div className="flex h-full w-full items-center justify-center p-6">
						<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					</div>
				) : (
					children
				)}
			</div>
		);
	},
);
Card.displayName = "Card";

/**
 * Card Header Component
 * Contains title, subtitle, and extra content
 */
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
	({ className, title, subtitle, extra, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn("flex flex-col space-y-1.5 p-6", className)}
				{...props}
			>
				<div className="flex items-center justify-between">
					<div>
						{title && (
							<h3 className="font-semibold leading-none tracking-tight">
								{title}
							</h3>
						)}
						{subtitle && (
							<p className="text-sm text-muted-foreground">{subtitle}</p>
						)}
					</div>
					{extra && <div>{extra}</div>}
				</div>
			</div>
		);
	},
);
CardHeader.displayName = "CardHeader";

/**
 * Card Content Component
 * Main content area of the card
 */
const CardContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

/**
 * Card Footer Component
 * Optional footer area for actions or additional information
 */
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
	({ className, children, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn("flex items-center p-6 pt-0", className)}
				{...props}
			>
				{children}
			</div>
		);
	},
);
CardFooter.displayName = "CardFooter";
