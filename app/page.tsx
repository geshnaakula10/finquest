import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-black mb-4">Finance Quest</h1>
      <p className="text-gray-300 mb-8">
        Learn finance by playing, not memorizing.
      </p>
      <Link
        href="/dashboard"
        className="
          bg-green-500 text-black px-8 py-4 rounded-full
          font-extrabold text-lg
          shadow-[0_6px_0_#15803d]
          hover:translate-y-1 transition
        "
      >
        Start Adventure 🚀
      </Link>
    </div>
  );
}
