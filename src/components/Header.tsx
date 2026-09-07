import Link from "next/link";
import type { Settings } from "@/lib/types";
import { getCategories } from "@/lib/data";
import HeaderClient from "./HeaderClient";

export default async function Header({ settings }: { settings: Settings }) {
  const categories = await getCategories();

  return <HeaderClient settings={settings} categories={categories} />;
}
