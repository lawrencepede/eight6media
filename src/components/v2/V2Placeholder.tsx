interface V2PlaceholderProps {
  page: string;
}

/**
 * Default placeholder for v2 marketing pages until their real designs
 * are dropped in. The route resolves, the version toggle works, and v1
 * stays untouched.
 */
const V2Placeholder = ({ page }: V2PlaceholderProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pt-32 pb-24 px-6 container mx-auto max-w-3xl text-center">
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-foreground/50 mb-6">
          v2 · Work in progress
        </p>
        <h1 className="font-serif text-5xl md:text-6xl mb-6">{page}</h1>
        <p className="font-sans text-base text-foreground/70 leading-relaxed">
          This is a placeholder for the v2 version of the {page} page. Use the
          toggle in the bottom-right to flip back to v1 for comparison. Drop
          the v2 design brief or code in chat and we'll build this page out.
        </p>
      </div>
    </div>
  );
};

export default V2Placeholder;
