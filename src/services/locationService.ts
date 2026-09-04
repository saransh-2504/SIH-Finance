/**
 * Location Service — Integration contract for teammate's geolocation PR.
 *
 * This file defines:
 *  - The canonical LocationData type used across the app
 *  - A useLocationStore hook (manual input today; swap body for GPS hook in PR)
 *  - A setLocationData() setter ready for the teammate's geolocation integration
 *
 * DO NOT change the exported types or function signatures — they are the merge contract.
 */

export interface LocationData {
  village: string;
  block: string;
  district: string;
  state: string;
  lat?: number;
  lng?: number;
  pincode?: string;
  /** Confidence of the location fix: "gps" | "manual" | "estimated" */
  source?: "gps" | "manual" | "estimated";
}

/** Empty / default location */
export const EMPTY_LOCATION: LocationData = {
  village: "",
  block: "",
  district: "",
  state: "",
  source: "manual",
};

// ---------------------------------------------------------------------------
// Simple in-memory store (no external dependency)
// Teammate's PR can replace the internals while keeping the same interface.
// ---------------------------------------------------------------------------

let _location: LocationData = { ...EMPTY_LOCATION };
const _listeners: Set<(data: LocationData) => void> = new Set();

/** Programmatically update location from any source (GPS, reverse-geocode, etc.) */
export function setLocationData(data: LocationData): void {
  _location = { ..._location, ...data };
  _listeners.forEach((fn) => fn(_location));
}

/** Read current location synchronously */
export function getLocationData(): LocationData {
  return _location;
}

/** Subscribe to location changes; returns unsubscribe function */
export function subscribeLocation(fn: (data: LocationData) => void): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

// ---------------------------------------------------------------------------
// React hook — wraps the store for component use
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";

export function useLocationStore() {
  const [location, setLocation] = useState<LocationData>(_location);

  useEffect(() => {
    const unsub = subscribeLocation(setLocation);
    return unsub;
  }, []);

  return {
    location,
    setLocationData,
    /** Convenience: fill from a form object (partial update) */
    updateField: (key: keyof LocationData, value: string | number) => {
      setLocationData({ ..._location, [key]: value });
    },
    /** True when all required fields are filled */
    isComplete: Boolean(location.village && location.district && location.state),
  };
}
