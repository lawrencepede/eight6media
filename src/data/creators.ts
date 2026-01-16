import mattPhoto from "@/assets/matt-photo.png";
import jaimePhoto from "@/assets/jaime-photo.png";
import amandaPhoto from "@/assets/amanda-photo.png";
import elizabethPhoto from "@/assets/elizabeth-photo.png";

export interface Creator {
  id: string;
  name: string;
  tagline: string;
  followers: string;
  impressions: string;
  audience: string;
  partners: string[];
  verticals: string[];
  image: string;
  bio?: string;
}

export const creators: Creator[] = [
  {
    id: "amanda-carr",
    name: "Amanda Carr",
    tagline: "Former Nurse | Mom",
    followers: "30K Followers",
    impressions: "4-5M Monthly Impressions",
    audience: "70%+ Female, Ages 25-44",
    partners: ["Oura Ring", "Cured Nutrition", "Branch Basics"],
    verticals: ["Health + Wellness", "Mom/Parenting"],
    image: amandaPhoto,
    bio: "Former nurse turned wellness advocate, sharing authentic health tips and parenting insights with an engaged community.",
  },
  {
    id: "matt-choi",
    name: "Matt Choi",
    tagline: "Endurance Athlete",
    followers: "400K+ Followers",
    impressions: "10-11M Monthly Impressions",
    audience: "80% Male, Ages 25-44",
    partners: ["Nike", "Lululemon", "Apple", "Garmin"],
    verticals: ["Fitness", "Apparel"],
    image: mattPhoto,
    bio: "Professional endurance athlete inspiring hundreds of thousands to push their limits through authentic fitness content.",
  },
  {
    id: "dr-jaime-seeman",
    name: "Dr. Jaime Seeman",
    tagline: "OBGYN/Surgeon | Fitness Creator",
    followers: "230K+ Followers",
    impressions: "1-2M Monthly Impressions",
    audience: "70% Female, Ages 25-44",
    partners: ["Branch Basics", "MindBodyGreen", "Lashify"],
    verticals: ["Health + Wellness", "Fitness", "Beauty"],
    image: jaimePhoto,
    bio: "Board-certified OBGYN surgeon combining medical expertise with fitness passion to educate and empower women.",
  },
  {
    id: "elizabeth-lane",
    name: "Elizabeth Lane",
    tagline: "Beauty & Lifestyle Creator",
    followers: "150K+ Followers",
    impressions: "3-4M Monthly Impressions",
    audience: "85% Female, Ages 18-35",
    partners: ["Sephora", "Glossier", "Summer Fridays"],
    verticals: ["Beauty", "Health + Wellness"],
    image: elizabethPhoto,
    bio: "Beauty enthusiast sharing honest reviews and lifestyle content with a highly engaged community.",
  },
];

export const verticals = [
  "Health + Wellness",
  "Beauty",
  "Apparel",
  "Mom/Parenting",
  "Pets",
  "Fitness",
];

export const getCreatorById = (id: string): Creator | undefined => {
  return creators.find(c => c.id === id);
};

export const getCreatorsByIds = (ids: string[]): Creator[] => {
  return creators.filter(c => ids.includes(c.id));
};
