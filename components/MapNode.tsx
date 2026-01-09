type MapNodeProps = {
  label: string;
  status: "completed" | "current" | "locked";
  href?: string;
};

export default function MapNode({ label, status, href }: MapNodeProps) {
  const styles = {
    completed:
      "bg-green-500 shadow-[0_6px_0_#15803d] hover:translate-y-1",
    current:
      "bg-yellow-400 shadow-[0_6px_0_#ca8a04] animate-bounce",
    locked:
      "bg-gray-600 opacity-50 cursor-not-allowed",
  };

  const node = (
    <div
      className={`
        w-16 h-16 rounded-full
        flex items-center justify-center
        text-xl font-black text-black
        transition-all duration-150
        ${styles[status]}
      `}
    >
      {label}
    </div>
  );

  return href && status !== "locked" ? <a href={href}>{node}</a> : node;
}
