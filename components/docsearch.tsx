"use client";

import { useState } from "react";

export function DocSearch() {
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	const openSearch = () => {
		setIsSearchOpen(true);
		// 使用alert提示搜索功能
		alert(
			"文档搜索功能即将上线！\n\n需要安装 @docsearch/react 依赖\n当前React版本(19.0.0-rc)与DocSearch不兼容",
		);
	};

	return (
		<button
			type="button"
			className="flex h-9 w-full items-center rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300"
			onClick={openSearch}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="mr-2 h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth="2"
				aria-hidden="true"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
			搜索文档...
		</button>
	);
}
