"use client";

import { useState, useEffect } from "react";

type FinanceNewsProps = {
  onRefresh?: () => void;
};

type NewsItem = {
  title: string;
  description?: string;
  category?: "trending" | "current" | "high-impact";
};

// Mock finance news headlines with descriptions
// Structured to support real API data later
const mockNewsItems: NewsItem[] = [
  {
    title: "Federal Reserve keeps interest rates steady amid economic uncertainty",
    description: "Central bank maintains current policy stance as inflation concerns persist",
    category: "high-impact",
  },
  {
    title: "Stock market reaches new highs as tech sector surges",
    description: "Major indices hit record levels driven by strong earnings and AI optimism",
    category: "trending",
  },
  {
    title: "Cryptocurrency regulations tighten in major economies",
    description: "New compliance requirements reshape digital asset markets globally",
    category: "current",
  },
  {
    title: "Housing market shows signs of cooling after record growth",
    description: "Price growth moderates as mortgage rates impact buyer demand",
    category: "current",
  },
  {
    title: "Global inflation rates decline for third consecutive month",
    description: "Central bank policies show effectiveness in curbing price pressures",
    category: "high-impact",
  },
  {
    title: "Renewable energy investments hit record $1.8 trillion worldwide",
    description: "Clean energy transition accelerates with unprecedented capital flows",
    category: "trending",
  },
  {
    title: "Central banks explore digital currency implementations",
    description: "CBDC pilots expand as nations prepare for future monetary systems",
    category: "high-impact",
  },
  {
    title: "Consumer spending patterns shift toward sustainable products",
    description: "ESG considerations increasingly influence purchasing decisions",
    category: "trending",
  },
];

/**
 * FinanceNews Component
 * Displays multiple finance headlines (3-5) with titles and descriptions
 * Prioritizes current, trending, and high-impact topics
 * Structured to support real API integration later
 */
export default function FinanceNews({ onRefresh }: FinanceNewsProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load initial news items (show 4-5 headlines)
  useEffect(() => {
    // Prioritize: high-impact first, then trending, then current
    const sorted = [...mockNewsItems].sort((a, b) => {
      const priority: Record<string, number> = {
        "high-impact": 1,
        trending: 2,
        current: 3,
      };
      return (priority[a.category || "current"] || 3) - (priority[b.category || "current"] || 3);
    });
    setNewsItems(sorted.slice(0, 5));
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Shuffle and re-prioritize news items
    const shuffled = [...mockNewsItems].sort(() => Math.random() - 0.5);
    const sorted = shuffled.sort((a, b) => {
      const priority: Record<string, number> = {
        "high-impact": 1,
        trending: 2,
        current: 3,
      };
      return (priority[a.category || "current"] || 3) - (priority[b.category || "current"] || 3);
    });
    setNewsItems(sorted.slice(0, 5));
    setIsRefreshing(false);
    
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur border border-white/10 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-300 uppercase tracking-wide">
          Finance News
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50 px-2 py-1 rounded"
          title="Refresh news"
        >
          {isRefreshing ? "⟳ Refreshing..." : "↻ Refresh"}
        </button>
      </div>
      
      {/* News Headlines List */}
      <div className="space-y-4">
        {newsItems.map((item, index) => (
          <div key={index}>
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-gray-200 leading-snug">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-xs text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
            {/* Divider between headlines (except last) */}
            {index < newsItems.length - 1 && (
              <div className="mt-4 pt-4 border-t border-white/5" />
            )}
          </div>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 pt-2">
        Stay informed about the latest financial trends and market updates.
      </p>
    </div>
  );
}
