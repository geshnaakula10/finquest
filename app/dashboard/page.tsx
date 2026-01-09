import MapNode from "@/components/MapNode";
import BossNode from "@/components/BossNode";
import PathLine from "@/components/PathLine";

export default function Dashboard() {
  const levels = [1, 2, 3, 4];
  const currentLevel = 3;

  return (
    <div className="min-h-screen flex flex-col items-center pt-12">
      <h1 className="text-4xl font-black mb-2">
        Budgeting Basics
      </h1>
      <p className="text-gray-300 mb-12">
        Master money one step at a time
      </p>

      <div className="flex flex-col items-center">
        {levels.map((level, index) => (
          <div
            key={level}
            className={`flex flex-col items-center ${
              index % 2 === 0 ? "ml-16" : "mr-16"
            }`}
          >
            <MapNode
              label={String(level)}
              status={
                level < currentLevel
                  ? "completed"
                  : level === currentLevel
                  ? "current"
                  : "locked"
              }
              href={`/level/${level}`}
            />
            <PathLine />
          </div>
        ))}

        <BossNode href="/boss/budgeting" />
        <PathLine />

        <MapNode label="🔒" status="locked" />
      </div>
    </div>
  );
}
