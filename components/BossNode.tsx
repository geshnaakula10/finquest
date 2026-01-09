export default function BossNode({ href }: { href: string }) {
  return (
    <a href={href}>
      <div
        className="
          w-24 h-24 rounded-full
          bg-gradient-to-br from-red-500 to-red-700
          flex items-center justify-center
          text-4xl
          shadow-[0_8px_0_#7f1d1d]
          animate-bounce
          my-4
        "
      >
        👹
      </div>
    </a>
  );
}
