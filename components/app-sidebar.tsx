"use client";

import { useRouter } from "next/navigation";

import { PlusIcon } from "@/components/icons";
import { SidebarHistory } from "@/components/sidebar-history";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { HelpCircle, LayoutGrid } from "lucide-react";

// 创建一个模拟用户对象
const mockUser = {
	id: "demo-user",
	name: "Demo User",
	email: "demo@example.com",
	image: null,
};

// 更新组件参数，不再需要传入用户
export function AppSidebar() {
	const router = useRouter();
	const { setOpenMobile } = useSidebar();

	return (
		<Sidebar className="group-data-[side=left]:border-r-0">
			<SidebarHeader>
				<SidebarMenu>
					<div className="flex flex-row justify-between items-center">
						<Link
							href="/"
							onClick={() => {
								setOpenMobile(false);
							}}
							className="flex flex-row gap-3 items-center"
						>
							<span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
								Chatbot
							</span>
						</Link>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									type="button"
									className="p-2 h-fit"
									onClick={() => {
										setOpenMobile(false);
										router.push("/");
										router.refresh();
									}}
								>
									<PlusIcon />
								</Button>
							</TooltipTrigger>
							<TooltipContent align="end">New Chat</TooltipContent>
						</Tooltip>
					</div>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<Button
					onClick={() => {
						router.push("/mcp");
					}}
					className="flex mx-4 flex-row items-center"
				>
					<LayoutGrid />
					<span>MCP Services</span>
				</Button>

				<Button
					onClick={() => {
						router.push("/docs");
					}}
					className="flex mx-4 mt-2 flex-row items-center"
				>
					<HelpCircle />
					<span>How To Use</span>
				</Button>

				<SidebarHistory user="demo-user" />
			</SidebarContent>

			<SidebarFooter>
				<SidebarUserNav user={mockUser} />
			</SidebarFooter>
		</Sidebar>
	);
}
