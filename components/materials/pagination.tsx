import * as React from "react";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface PaginationProps {
	page: number;
	pageSize: number;
	total: number;
	onChange?: (page: number, pageSize: number) => void;
	className?: string;
	showSizeChanger?: boolean;
	showQuickJumper?: boolean;
	showTotal?: boolean;
	disabled?: boolean;
	simple?: boolean;
}

/**
 * Pagination Component
 * A component for handling pagination of data
 */
export function Pagination({
	page = 1,
	pageSize = 10,
	total = 0,
	onChange,
	className,
	showSizeChanger = false,
	showQuickJumper = false,
	showTotal = true,
	disabled = false,
	simple = false,
}: PaginationProps) {
	const [currentPage, setCurrentPage] = React.useState(page);
	const [currentPageSize, setCurrentPageSize] = React.useState(pageSize);
	const [jumpPage, setJumpPage] = React.useState("");

	// Calculate total pages
	const totalPages = Math.ceil(total / currentPageSize);

	// Update when props change
	React.useEffect(() => {
		setCurrentPage(page);
		setCurrentPageSize(pageSize);
	}, [page, pageSize]);

	// Handle page change
	const handlePageChange = (newPage: number) => {
		if (newPage < 1 || newPage > totalPages || disabled) return;
		setCurrentPage(newPage);
		onChange?.(newPage, currentPageSize);
	};

	// Handle page size change
	const handlePageSizeChange = (
		event: React.ChangeEvent<HTMLSelectElement>,
	) => {
		const newPageSize = Number(event.target.value);
		const newTotalPages = Math.ceil(total / newPageSize);
		const newPage = Math.min(currentPage, newTotalPages);
		setCurrentPageSize(newPageSize);
		setCurrentPage(newPage);
		onChange?.(newPage, newPageSize);
	};

	// Handle quick jump
	const handleQuickJump = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			const page = Number(jumpPage);
			if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
				handlePageChange(page);
			}
			setJumpPage("");
		}
	};

	// Generate page items
	const getPageItems = () => {
		const items = [];
		const maxPages = simple ? 5 : 7;
		let start = 1;
		let end = totalPages;

		if (totalPages > maxPages) {
			const sidePages = Math.floor((maxPages - 1) / 2);
			if (currentPage <= sidePages + 1) {
				end = maxPages;
			} else if (currentPage >= totalPages - sidePages) {
				start = totalPages - maxPages + 1;
			} else {
				start = currentPage - sidePages;
				end = currentPage + sidePages;
			}
		}

		for (let i = start; i <= end; i++) {
			items.push(
				<Button
					key={i}
					variant={currentPage === i ? "default" : "outline"}
					size="icon"
					className="h-8 w-8"
					disabled={disabled}
					onClick={() => handlePageChange(i)}
				>
					{i}
				</Button>,
			);
		}

		return items;
	};

	return (
		<div
			className={cn("flex items-center justify-between space-x-2", className)}
		>
			{showTotal && (
				<div className="text-sm text-muted-foreground">Total {total} items</div>
			)}
			<div className="flex items-center space-x-2">
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					disabled={currentPage === 1 || disabled}
					onClick={() => handlePageChange(1)}
				>
					<ChevronsLeft className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					disabled={currentPage === 1 || disabled}
					onClick={() => handlePageChange(currentPage - 1)}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				{getPageItems()}
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					disabled={currentPage === totalPages || disabled}
					onClick={() => handlePageChange(currentPage + 1)}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					disabled={currentPage === totalPages || disabled}
					onClick={() => handlePageChange(totalPages)}
				>
					<ChevronsRight className="h-4 w-4" />
				</Button>
			</div>
			{showSizeChanger && (
				<select
					className="h-8 rounded-md border border-input bg-background px-2 text-sm"
					value={currentPageSize}
					onChange={handlePageSizeChange}
					disabled={disabled}
				>
					<option value="10">10 / page</option>
					<option value="20">20 / page</option>
					<option value="50">50 / page</option>
					<option value="100">100 / page</option>
				</select>
			)}
			{showQuickJumper && (
				<div className="flex items-center space-x-2">
					<span className="text-sm text-muted-foreground">Go to</span>
					<input
						type="number"
						className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm"
						value={jumpPage}
						onChange={(e) => setJumpPage(e.target.value)}
						onKeyDown={handleQuickJump}
						disabled={disabled}
						min={1}
						max={totalPages}
					/>
				</div>
			)}
		</div>
	);
}
