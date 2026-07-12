"use client";

import { useEffect } from "react";
import { fireConfetti } from "@/lib/confetti";

export function ConfettiOnMount() {
  useEffect(() => {
    const timer = setTimeout(() => fireConfetti(), 300);
    return () => clearTimeout(timer);
  }, []);

  return null;
}