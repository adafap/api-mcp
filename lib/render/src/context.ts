import * as React from "react";
import type { Schema, JSFunction } from "./types";
import { evaluateFunction } from "./expression";
import { isEqual } from "./utils";
import type { ReactNode } from "react";

/**
 * Render Context
 * Used to manage rendering context and state
 */

export interface RenderContextState {
	theme: "light" | "dark";
	locale: string;
	components: Map<string, React.ComponentType>;
	styles: Map<string, string>;
	data: Map<string, unknown>;
}

export interface BaseRenderContext {
	state: Record<string, unknown>;
	setState: (state: Record<string, unknown>) => void;
	getState: () => Record<string, unknown>;
	batchUpdate: (updater: () => void) => void;
	onStateChange?: (state: Record<string, unknown>) => void;
	autoRerender?: boolean;
	rerender?: () => void;
	props?: Record<string, unknown>;
	schema?: Schema;
	components?: Map<string, React.ComponentType>;
	utils?: Record<string, unknown>;
	this?: BaseRenderContext;
}

export class RenderContextImpl implements BaseRenderContext {
	private contextState: RenderContextState;
	state: Record<string, unknown>;
	props?: Record<string, unknown>;
	schema?: Schema;
	components?: Map<string, React.ComponentType>;
	utils?: Record<string, unknown>;
	this?: BaseRenderContext;
	onStateChange?: (state: Record<string, unknown>) => void;
	autoRerender?: boolean;
	rerender?: () => void;

	constructor() {
		this.contextState = {
			theme: "light",
			locale: "en",
			components: new Map(),
			styles: new Map(),
			data: new Map(),
		};
		this.state = {};
	}

	/**
	 * Set theme
	 */
	setTheme(theme: "light" | "dark"): void {
		this.contextState.theme = theme;
	}

	/**
	 * Get current theme
	 */
	getTheme(): "light" | "dark" {
		return this.contextState.theme;
	}

	/**
	 * Set locale
	 */
	setLocale(locale: string): void {
		this.contextState.locale = locale;
	}

	/**
	 * Get current locale
	 */
	getLocale(): string {
		return this.contextState.locale;
	}

	/**
	 * Register component
	 */
	registerComponent(name: string, component: React.ComponentType): void {
		this.contextState.components.set(name, component);
	}

	/**
	 * Get registered component
	 */
	getComponent(name: string): React.ComponentType | undefined {
		return this.contextState.components.get(name);
	}

	/**
	 * Register style
	 */
	registerStyle(name: string, style: string): void {
		this.contextState.styles.set(name, style);
	}

	/**
	 * Get registered style
	 */
	getStyle(name: string): string | undefined {
		return this.contextState.styles.get(name);
	}

	/**
	 * Set data
	 */
	setData(key: string, value: unknown): void {
		this.contextState.data.set(key, value);
	}

	/**
	 * Get data
	 */
	getData(key: string): unknown | undefined {
		return this.contextState.data.get(key);
	}

	/**
	 * Clear all data
	 */
	clearData(): void {
		this.contextState.data.clear();
	}

	/**
	 * Render component
	 */
	renderComponent(name: string, props: Record<string, unknown>): ReactNode {
		const Component = this.getComponent(name);
		if (!Component) {
			throw new Error(`Component not found: ${name}`);
		}
		return React.createElement(Component, props);
	}

	/**
	 * Create child context
	 */
	createChildContext(): RenderContextImpl {
		const child = new RenderContextImpl();
		child.contextState = {
			...this.contextState,
			components: new Map(this.contextState.components),
			styles: new Map(this.contextState.styles),
			data: new Map(this.contextState.data),
		};
		return child;
	}

	setState(newState: Record<string, unknown>): void {
		this.state = { ...this.state, ...newState };
		if (this.onStateChange) {
			this.onStateChange(this.state);
		}
		if (this.autoRerender && this.rerender) {
			this.rerender();
		}
	}

	getState(): Record<string, unknown> {
		return { ...this.state };
	}

	batchUpdate(updater: () => void): void {
		const prevState = { ...this.state };
		updater();
		if (this.onStateChange) {
			this.onStateChange(this.state);
		}
		if (this.autoRerender && this.rerender) {
			this.rerender();
		}
	}
}

// Create default render context instance
let defaultContext: RenderContextImpl | null = null;

/**
 * Get default render context instance
 */
export function getDefaultContext(): RenderContextImpl {
	if (!defaultContext) {
		defaultContext = new RenderContextImpl();
	}
	return defaultContext;
}

/**
 * Create new render context instance
 */
export function createContext(): RenderContextImpl {
	return new RenderContextImpl();
}

/**
 * 状态管理器
 */
class StateManager<T extends Record<string, unknown>> {
	private state: T;
	private listeners: Array<(state: T, changedKeys: string[]) => void> = [];
	private batching = false;
	private pendingState: T | null = null;
	private pendingChanges: Set<string> = new Set();
	private updateScheduled = false;
	private updateTimer: ReturnType<typeof setTimeout> | null = null;

	/**
	 * 创建状态管理器
	 * @param initialState 初始状态
	 */
	constructor(initialState: T = {} as T) {
		this.state = { ...initialState };
	}

	/**
	 * 获取当前状态
	 * @returns 当前状态的拷贝
	 */
	get(): T {
		return { ...this.state };
	}

	/**
	 * 设置状态
	 * @param newState 新状态
	 * @returns 更新后的状态
	 */
	set(newState: Partial<T>): T {
		// 获取变化的键
		const changedKeys = this.getChangedKeys(this.state, newState);

		// 如果没有变化，直接返回当前状态
		if (changedKeys.length === 0) {
			return this.state;
		}

		// 批量更新处理
		if (this.batching) {
			// 合并变更到pendingState
			this.pendingState = this.pendingState || { ...this.state };
			for (const [key, value] of Object.entries(newState)) {
				if (this.pendingState) {
					(this.pendingState as Record<string, unknown>)[key] = value;
				}
				this.pendingChanges.add(key);
			}
			return this.state;
		}

		// 更新状态
		const prevState = this.state;
		this.state = { ...this.state, ...newState };

		// 防抖通知，合并短时间内的多次更新
		this.scheduleNotification(prevState, changedKeys);

		return this.state;
	}

	/**
	 * 批量更新状态（减少重渲染次数）
	 * @param updater 状态更新函数
	 */
	batch(updater: () => void): void {
		// 如果已经在批处理中，直接运行更新函数
		if (this.batching) {
			updater();
			return;
		}

		this.batching = true;
		this.pendingState = { ...this.state };
		this.pendingChanges.clear();

		try {
			updater();
		} finally {
			const prevState = this.state;

			// 应用所有批量更新
			if (this.pendingState && this.pendingChanges.size > 0) {
				this.state = this.pendingState;
				const changedKeysArray = Array.from(this.pendingChanges);

				// 防抖通知
				this.scheduleNotification(prevState, changedKeysArray);
			}

			this.batching = false;
			this.pendingState = null;
			this.pendingChanges.clear();
		}
	}

	/**
	 * 注册状态变化监听器
	 * @param listener 监听函数
	 * @returns 取消监听的函数
	 */
	subscribe(listener: (state: T, changedKeys: string[]) => void): () => void {
		this.listeners.push(listener);

		// 返回取消订阅函数
		return () => {
			this.unsubscribe(listener);
		};
	}

	/**
	 * 取消注册监听器
	 * @param listener 要取消的监听函数
	 */
	unsubscribe(listener: (state: T, changedKeys: string[]) => void): void {
		const index = this.listeners.indexOf(listener);
		if (index > -1) {
			this.listeners.splice(index, 1);
		}
	}

	/**
	 * 调度通知 - 使用防抖合并短时间内的多次更新
	 * @param prevState 先前的状态
	 * @param changedKeys 变化的键列表
	 */
	private scheduleNotification(prevState: T, changedKeys: string[]): void {
		// 如果没有监听器或没有变化，直接返回
		if (this.listeners.length === 0 || changedKeys.length === 0) {
			return;
		}

		// 如果已经调度了更新，清除之前的定时器
		if (this.updateScheduled && this.updateTimer) {
			clearTimeout(this.updateTimer);
		}

		this.updateScheduled = true;

		// 使用微任务队列（Promise.resolve().then）来合并同步代码块中的所有更新
		// 这比setTimeout更快，确保在下一个渲染周期之前完成所有状态更新
		this.updateTimer = setTimeout(() => {
			this.updateScheduled = false;
			this.updateTimer = null;

			// 通知所有监听器
			this.notifyListeners(prevState, changedKeys);
		}, 0);
	}

	/**
	 * 通知所有监听器
	 * @param prevState 先前的状态
	 * @param changedKeys 变化的键列表
	 */
	private notifyListeners(prevState: T, changedKeys: string[]): void {
		// 如果有变化才通知监听器
		if (changedKeys.length > 0) {
			const currentState = this.state;
			for (const listener of this.listeners) {
				try {
					listener(currentState, changedKeys);
				} catch (error) {
					console.error("状态监听器执行出错:", error);
				}
			}
		}
	}

	/**
	 * 获取变化的属性列表
	 * 此方法会比较旧状态和新状态中的所有属性，找出发生变化的属性列表
	 * 使用了深度比较算法确保复杂对象也能正确比较
	 *
	 * @param oldState 旧状态对象
	 * @param newState 新状态对象
	 * @returns 变化的属性键名数组
	 */
	private getChangedKeys(oldState: T, newState: Partial<T>): string[] {
		const changedKeys: string[] = [];
		// 检查newState中的每个键
		for (const key of Object.keys(newState)) {
			// 如果oldState中不存在这个键，或者值不相等，则认为有变化
			if (
				!Object.prototype.hasOwnProperty.call(oldState, key) ||
				!isEqual(oldState[key], newState[key])
			) {
				changedKeys.push(key);
			}
		}

		return changedKeys;
	}
}

/**
 * 创建渲染上下文
 * @param schema Schema对象
 * @param context 父上下文
 * @returns 渲染上下文
 */
export function createRenderContext(
	schema: Schema,
	context: Partial<BaseRenderContext> = {},
): BaseRenderContext {
	// 创建状态管理器
	const stateManager = new StateManager(schema.state || {});

	// 标记是否需要自动重新渲染
	const shouldAutoRerender = context.autoRerender !== false;

	// 记录上一次渲染更新的时间戳，用于防止过于频繁的更新
	let lastRerenderTimestamp = 0;

	// 使用防抖控制渲染更新
	let rerenderTimer: ReturnType<typeof setTimeout> | null = null;

	// 防抖重新渲染函数
	const debouncedRerender = () => {
		// 如果已存在定时器，取消它
		if (rerenderTimer) {
			clearTimeout(rerenderTimer);
		}

		// 检查从上次渲染到现在的时间间隔
		const now = Date.now();
		const timeSinceLastRerender = now - lastRerenderTimestamp;

		// 如果时间间隔小于16ms（一帧），延迟更新
		// 否则立即更新
		const delay = timeSinceLastRerender < 16 ? 16 - timeSinceLastRerender : 0;

		// 设置新的定时器
		rerenderTimer = setTimeout(() => {
			// 记录本次渲染时间
			lastRerenderTimestamp = Date.now();

			// 触发渲染更新
			if (shouldAutoRerender && baseContext.rerender) {
				try {
					baseContext.rerender();
				} catch (err) {
					console.error("触发渲染更新失败:", err);
				}
			}

			rerenderTimer = null;
		}, delay);
	};

	// 基础上下文
	const baseContext: BaseRenderContext = {
		...context,
		state: stateManager.get(),
		// 自动重新渲染标志
		autoRerender: shouldAutoRerender,
		// 内部重新渲染器
		rerender: context.rerender || (() => {}),
		// 设置状态方法
		setState: (newState: Record<string, unknown>) => {
			// 获取更新前的状态用于比较
			const prevState = stateManager.get();

			// 更新状态 - stateManager会比较并仅更新有变化的属性
			stateManager.set(newState);

			// 更新上下文中的state属性
			baseContext.state = stateManager.get();

			// 调用状态变化回调
			if (
				baseContext.onStateChange &&
				typeof baseContext.onStateChange === "function"
			) {
				baseContext.onStateChange(baseContext.state);
			}

			// 如果启用了自动重新渲染，则触发渲染更新
			if (shouldAutoRerender) {
				debouncedRerender();
			}

			return baseContext.state;
		},
		getState: () => stateManager.get(),
		batchUpdate: (updater: () => void) => {
			stateManager.batch(updater);

			// 更新上下文中的state属性
			baseContext.state = stateManager.get();

			// 通知状态变更
			if (
				baseContext.onStateChange &&
				typeof baseContext.onStateChange === "function"
			) {
				baseContext.onStateChange(baseContext.state);
			}

			// 如果启用了自动重新渲染，则触发渲染更新
			if (shouldAutoRerender) {
				debouncedRerender();
			}
		},
	};

	// 确保this指向上下文自身
	baseContext.this = baseContext;

	// 处理schema中的methods
	if (schema.methods) {
		for (const [methodName, methodDef] of Object.entries(schema.methods)) {
			if (methodDef && (methodDef as JSFunction).type === "JSFunction") {
				const fn = evaluateFunction(
					methodDef as JSFunction,
					baseContext as unknown as RenderContext,
				);
				if (typeof fn === "function") {
					(baseContext as unknown as Record<string, unknown>)[methodName] = fn;
					if (baseContext.this) {
						(baseContext.this as unknown as Record<string, unknown>)[
							methodName
						] = fn;
					}
				}
			}
		}
	}

	// 订阅状态变更，以支持更精细的控制
	stateManager.subscribe((newState, changedKeys) => {
		// 更新上下文状态对象的引用
		baseContext.state = newState;

		// 可以在这里添加对特定属性变化的处理

		// 回调特定状态变化监听器
		if (baseContext.onStateChange && changedKeys.length > 0) {
			try {
				baseContext.onStateChange(newState);
			} catch (err) {
				console.error("状态变化回调执行出错:", err);
			}
		}
	});

	return baseContext;
}
