interface BestSellerBannerProps {
    labelName?: string;
}
export default function BestSellerBanner({ labelName }: BestSellerBannerProps) {
  return (
    <div
      className="
        pointer-events-none
        absolute
        left-[4px]
        top-[-3px]
        z-20
        skew-x-[-10deg]

        sm:left-[4px]
        sm:top-[-8px]

        lg:left-[4px]
      "
    >
      <div
        className="
          flex
          h-[28px]
          min-w-[92px]
          items-center
          justify-center
          border-[1px]
          border-white
          bg-[#EB1F27]
          px-[6px]
          shadow-[0_2px_4px_rgba(0,0,0,0.25)]

          sm:h-[32px]
          sm:min-w-[105px]
          sm:border-[3px]

          lg:h-[36px]
          lg:min-w-[120px]
          lg:px-[7px]
        "
      >
        <span
          className="
            whitespace-nowrap
            font-sans
            text-[14px]
            font-black
       
            leading-none
            tracking-[-0.5px]
            text-white
            [text-shadow:1px_1px_2px_rgba(0,0,0,0.35)]

            sm:text-[16px]
            lg:text-[18px]
          "
        >
            {labelName || "Best seller"}
        </span>
      </div>
    </div>
  );
}