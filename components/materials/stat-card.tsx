import * as React from "react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

interface StatCardProps {
	title: React.ReactNode;
	value: React.ReactNode;
	description?: React.ReactNode;
	icon?: React.ReactNode;
	trend?: {
		value: number;
		type: "increase" | "decrease";
		label?: string;
	};
	loading?: boolean;
	className?: string;
	style?: React.CSSProperties;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
}

/**
 * Stat Card Component
 * A card component for displaying statistics with optional trend indicators
 */
export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
	(
		{ className, title, value, description, icon, trend, loading, ...props },
		ref,
	) => {
		return (
			<Card
				ref={ref}
				className={cn("flex flex-col space-y-3 p-6", className)}
				loading={loading}
				{...props}
			>
				<div className="flex items-center justify-between">
					<p className="text-sm font-medium text-muted-foreground">{title}</p>
					{icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
				</div>
				<div className="flex items-end justify-between">
					<div>
						<div className="text-2xl font-bold">{value}</div>
						{description && (
							<p className="text-sm text-muted-foreground">{description}</p>
						)}
					</div>
					{trend && (
						<div
							className={cn(
								"flex items-center rounded-md px-2 py-1 text-xs font-medium",
								trend.type === "increase"
									? "bg-green-100 text-green-600"
									: "bg-red-100 text-red-600",
							)}
						>
							<span>
								{trend.type === "increase" ? "+" : "-"}
								{Math.abs(trend.value)}%
							</span>
							{trend.label && (
								<span className="ml-1 text-muted-foreground">
									{trend.label}
								</span>
							)}
						</div>
					)}
				</div>
			</Card>
		);
	},
);

StatCard.displayName = "StatCard";
