"use client";

import Image from "next/image";

type PlayerInfoProps = {
  name: string;
  character: string;
  characterImage: string;
};

const characterNames: Record<string, string> = {
  explorer: "Explorer",
  strategist: "Strategist",
  dreamer: "Dreamer",
  realist: "Realist",
};

/**
 * PlayerInfo Component
 * Displays the player's character image in hero-style (large, transparent background)
 * Positioned on the left side of the dashboard
 */
export default function PlayerInfo({
  name,
  character,
  characterImage,
}: PlayerInfoProps) {
  return (
    <div className="flex flex-col items-start gap-3">
      {/* Character Image - Hero Style: Large, transparent background, no circular container */}
      <div className="relative w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64">
        <Image
          src={characterImage}
          alt={character}
          width={256}
          height={256}
          className="object-contain w-full h-full"
          style={{ imageRendering: "auto" }}
          priority
        />
      </div>
      {/* Character Name */}
      <div className="text-left">
        <p className="text-lg font-bold">{name}</p>
        <p className="text-sm text-gray-400 capitalize">
          {characterNames[character] || character}
        </p>
      </div>
    </div>
  );
}
