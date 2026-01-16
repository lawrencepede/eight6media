import { useState, useEffect } from "react";

export interface Pitch {
  id: string;
  slug: string;
  brandName: string;
  headline: string;
  description: string;
  creatorIds: string[];
  createdAt: string;
}

const STORAGE_KEY = "eight6media_pitches";

export const usePitches = () => {
  const [pitches, setPitches] = useState<Pitch[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setPitches(JSON.parse(stored));
    }
  }, []);

  const savePitches = (newPitches: Pitch[]) => {
    setPitches(newPitches);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPitches));
  };

  const createPitch = (pitch: Omit<Pitch, "id" | "createdAt">) => {
    const newPitch: Pitch = {
      ...pitch,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    savePitches([...pitches, newPitch]);
    return newPitch;
  };

  const updatePitch = (id: string, updates: Partial<Pitch>) => {
    const updated = pitches.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    savePitches(updated);
  };

  const deletePitch = (id: string) => {
    savePitches(pitches.filter(p => p.id !== id));
  };

  const getPitchBySlug = (slug: string): Pitch | undefined => {
    return pitches.find(p => p.slug === slug);
  };

  return {
    pitches,
    createPitch,
    updatePitch,
    deletePitch,
    getPitchBySlug,
  };
};
