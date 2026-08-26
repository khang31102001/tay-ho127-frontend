// src/components/ui/MenuBackgroundDecoration.tsx

interface TriangleMotifProps {
  className?: string;
  style?: React.CSSProperties;
}

function TriangleMotif({ className, style }: TriangleMotifProps) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={style}
    >
      <path
        d="
          M14 68
          C7 68 4 64 5 58
          C5.5 55 7 52 10 49
          L51 12
          C56 7 64 7 69 12
          L110 49
          C113 52 115 56 115 60
          C115 65 111 68 105 68
          H14
          Z
        "
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MenuBackgroundDecoration({
leftColor = "#FF9418",
  rightColor = "#F5C884",
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Canvas trang trí */}
      <div className="absolute inset-y-0 left-1/2 w-full -translate-x-1/2">
        {/* =========================================
         * BÊN TRÁI
         * ======================================= */}
        <div className="absolute left-2 top-3 flex flex-col gap-1 md:left-3 md:top-6">
          <TriangleMotif className="h-auto w-[48px] md:w-[60px] " style={{ color: leftColor }} />
          <TriangleMotif className="h-auto w-[48px]  md:w-[60px]" style={{ color: leftColor }} />
          <TriangleMotif className="h-auto w-[48px]  md:w-[60px]" style={{ color: leftColor }} />
        </div>

        {/* =========================================
         * BÊN PHẢI
         * ======================================= */}
        <div
          className="
            absolute
            -right-[38px]
            top-[40px]
            flex
            flex-col
            gap-4
            md:top-[70px]
            md:gap-7
          "
        >
          <TriangleMotif className="h-auto w-[190px]  md:w-[260px]" style={{ color: rightColor }} />
          <TriangleMotif className="h-auto w-[190px]  md:w-[260px]" style={{ color: rightColor }} />
          <TriangleMotif className="h-auto w-[190px] md:w-[260px]" style={{ color: rightColor }}   />
        </div>
      </div>
    </div>
  );
}