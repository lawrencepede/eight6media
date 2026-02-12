interface MarqueeBannerProps {
  text: string;
  bgClass?: string;
  textClass?: string;
}

const MarqueeBanner = ({ text, bgClass = "bg-accent", textClass = "text-accent-foreground" }: MarqueeBannerProps) => {
  const repeated = Array(8).fill(text);
  
  return (
    <div className={`${bgClass} overflow-hidden py-3 md:py-4`}>
      <div className="animate-marquee flex whitespace-nowrap">
        {repeated.map((t, i) => (
          <span key={i} className={`font-display text-lg md:text-xl tracking-wider ${textClass} mx-8`}>
            {t}
          </span>
        ))}
        {repeated.map((t, i) => (
          <span key={`dup-${i}`} className={`font-display text-lg md:text-xl tracking-wider ${textClass} mx-8`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeBanner;
