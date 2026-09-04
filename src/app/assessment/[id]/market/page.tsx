"use client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  useEffect(() => {
    router.replace(`/assessment/${id}`);
  }, [id, router]);
  return null;
}
