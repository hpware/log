import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function truncateText(text: string, maxLength: number = 150): { displayText: string; isTruncated: boolean } {
	const cleanText = text || "";
	if (cleanText.length <= maxLength) {
		return { displayText: cleanText, isTruncated: false };
	}
	const truncated = cleanText.substring(0, maxLength).trim();
	return { displayText: truncated, isTruncated: true };
}
