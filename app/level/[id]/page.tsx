type LevelPageProps = {
  params: {
    id: string;
  };
};

export default function LevelPage({ params }: LevelPageProps) {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl mb-4">Level {params.id}</h1>

      <div className="h-48 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
        Animation Placeholder
      </div>

      <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center mb-6">
        Mini Game Placeholder
      </div>

      <a
  href="/dashboard"
  className="
    inline-block px-8 py-4 bg-green-500 text-black
    rounded-full font-extrabold text-lg
    shadow-[0_6px_0_#15803d]
    hover:translate-y-1 transition
  "
>
  Complete Level ✅
</a>
<div className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold shadow-lg">
  ⭐ XP 120
</div>

    </div>
  );
}
