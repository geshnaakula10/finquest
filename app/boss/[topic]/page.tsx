"use client";

import { useEffect } from "react";

type BossPageProps = {
  params: {
    topic: string;
  };
};

export default function BossFight({ params }: BossPageProps) {
  useEffect(() => {
    window.location.href = "https://procoder.itch.io/vikranth30";
  }, []);

  return null;
}