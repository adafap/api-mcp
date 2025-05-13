import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
	collapsed?: boolean;
	width?: string | number;
	collapsedWidth?: string | number;
}

interface SidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
	icon?: React.ReactNode;
	active?: boolean;
	disabled?: boolean;
}

/**
 * Sidebar Component
 * A collapsible sidebar navigation component
 */
const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
	(
		{
			className,
			collapsed = false,
			width = "240px",
			collapsedWidth = "64px",
			...props
		},
		ref,
	) => {
		const style = {
			width: collapsed ? collapsedWidth : width,
			minWidth: collapsed ? collapsedWidth : width,
			maxWidth: collapsed ? collapsedWidth : width,
		};

		return (
			<div
				ref={ref}
				className={cn(
					"flex h-full flex-col border-r bg-background transition-all duration-300",
					className,
				)}
				style={style}
				{...props}
			/>
		);
	},
);
Sidebar.displayName = "Sidebar";

/**
 * Sidebar Header Component
 * The header section of the sidebar
 */
const SidebarHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex h-14 items-center border-b px-4", className)}
		{...props}
	/>
));
SidebarHeader.displayName = "SidebarHeader";

/**
 * Sidebar Content Component
 * The main content area of the sidebar
 */
const SidebarContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex-1 overflow-auto py-2", className)}
		{...props}
	/>
));
SidebarContent.displayName = "SidebarContent";

/**
 * Sidebar Footer Component
 * The footer section of the sidebar
 */
const SidebarFooter = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex h-14 items-center border-t px-4", className)}
		{...props}
	/>
));
SidebarFooter.displayName = "SidebarFooter";

/**
 * Sidebar Item Component
 * Individual clickable item in the sidebar
 */
const SidebarItem = React.forwardRef<HTMLDivElement, SidebarItemProps>(
	({ className, icon, active, disabled, children, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
				active && "bg-accent text-accent-foreground",
				disabled && "pointer-events-none opacity-50",
				className,
			)}
			{...props}
		>
			{icon && <div className="h-4 w-4">{icon}</div>}
			{children}
		</div>
	),
);
SidebarItem.displayName = "SidebarItem";

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarItem };
