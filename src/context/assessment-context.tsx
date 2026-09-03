"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { assessmentsApi, type Assessment } from "@/lib/api-client";

interface AssessmentContextValue {
  assessments: Assessment[];
  current: Assessment | null;
  loading: boolean;
  error: string | null;
  loadAssessments: () => Promise<void>;
  loadAssessment: (id: string) => Promise<Assessment>;
  deleteAssessment: (id: string) => Promise<void>;
  setCurrent: (a: Assessment | null) => void;
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [current, setCurrent] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAssessments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assessmentsApi.list();
      setAssessments(data);
    } catch {
      setError("Unable to load assessments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAssessment = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const a = await assessmentsApi.get(id);
      setCurrent(a);
      return a;
    } catch {
      setError("Unable to load this assessment.");
      throw new Error("Assessment not found.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAssessment = useCallback(async (id: string) => {
    await assessmentsApi.delete(id);
    setAssessments((prev) => prev.filter((a) => a.id !== id));
    if (current?.id === id) setCurrent(null);
  }, [current]);

  return (
    <AssessmentContext.Provider
      value={{ assessments, current, loading, error, loadAssessments, loadAssessment, deleteAssessment, setCurrent }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessments(): AssessmentContextValue {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error("useAssessments must be inside AssessmentProvider");
  return ctx;
}
