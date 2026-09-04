"use client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AssessmentReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  useEffect(() => {
    router.replace(`/reports`);
  }, [id, router]);
  return null;
}
