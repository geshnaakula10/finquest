type BossPageProps = {
  params: {
    topic: string;
  };
};

export default function BossFight({ params }: BossPageProps) {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl mb-6">
        Boss Fight: {params.topic}
      </h1>

      <div className="flex justify-between mb-6">
        <div>Player ❤️❤️❤️</div>
        <div>Villain 💀💀💀</div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        Question placeholder
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button className="bg-green-600 p-3 rounded">
          Correct Option
        </button>
        <button className="bg-red-600 p-3 rounded">
          Wrong Option
        </button>
      </div>
    </div>
  );
}
