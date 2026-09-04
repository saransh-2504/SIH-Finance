"use client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AssessmentFinancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  useEffect(() => {
    router.replace(`/finance?assessment=${id}`);
  }, [id, router]);
  return null;
}
