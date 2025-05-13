import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { forwardRef, useMemo } from "react";
import type { ComponentPropsWithoutRef } from "react";

interface RenderContext {
	[key: string]: unknown;
}

declare global {
	interface Window {
		__RENDER_CONTEXT__?: RenderContext;
	}
}

/**
 * 输入框组件封装
 * 支持所有原生input属性，如placeholder、type、disabled等
 * 支持从渲染器上下文获取值
 */
export const InputComponent = forwardRef<
	HTMLInputElement,
	ComponentPropsWithoutRef<"input"> & {
		bindValue?: { type: "JSExpression"; value: string };
		bindChange?: { type: "JSExpression"; value: string };
	}
>(({ bindValue, bindChange, ...props }, ref) => {
	const contextValue = useMemo(() => {
		if (bindValue?.type === "JSExpression") {
			try {
				return window.__RENDER_CONTEXT__?.[bindValue.value];
			} catch (e) {
				console.error("Failed to compute binding value:", e);
			}
		}
		return undefined;
	}, [bindValue]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (bindChange?.type === "JSExpression") {
			try {
				const fn = window.__RENDER_CONTEXT__?.[bindChange.value];
				if (typeof fn === "function") {
					fn(e.target.value);
				}
			} catch (e) {
				console.error("Failed to execute binding function:", e);
			}
		}
		props.onChange?.(e);
	};

	return (
		<Input
			ref={ref}
			{...props}
			value={contextValue !== undefined ? contextValue : props.value}
			onChange={handleChange}
		/>
	);
});

InputComponent.displayName = "InputComponent";

export interface InputProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		"prefix" | "suffix"
	> {
	error?: string;
	prefix?: React.ReactNode;
	suffix?: React.ReactNode;
}

/**
 * Input Component
 * A form input field with support for error states and prefix/suffix content
 */
const InputComponentForm = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, error, prefix, suffix, ...props }, ref) => {
		return (
			<div className="relative">
				{prefix && (
					<div className="absolute inset-y-0 left-0 flex items-center pl-3">
						{prefix}
					</div>
				)}
				<input
					type={type}
					className={cn(
						"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
						error && "border-destructive focus-visible:ring-destructive",
						prefix && "pl-10",
						suffix && "pr-10",
						className,
					)}
					ref={ref}
					{...props}
				/>
				{suffix && (
					<div className="absolute inset-y-0 right-0 flex items-center pr-3">
						{suffix}
					</div>
				)}
				{error && <p className="mt-1 text-sm text-destructive">{error}</p>}
			</div>
		);
	},
);
InputComponentForm.displayName = "InputComponentForm";

export { InputComponentForm };
