import { AppCardList } from "@/components/app-card-list";
import { AddAppButton } from "@/components/add-app-button";

export default function Home() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-semibold">MCP Server</h1>
				<AddAppButton />
			</div>
			<AppCardList />
		</div>
	);
}
