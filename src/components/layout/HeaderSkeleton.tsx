export const HeaderSkeleton = () => (
  <div className="container mx-auto px-4 py-4">
    <div className="hidden md:flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-6 w-40 rounded bg-white/10 animate-pulse" />
        <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
      </div>
      <div className="flex items-center gap-4">
        <div className="h-8 w-24 rounded bg-white/10 animate-pulse" />
        <div className="h-8 w-10 rounded-full bg-white/10 animate-pulse" />
        <div className="h-8 w-10 rounded-full bg-white/10 animate-pulse" />
      </div>
    </div>
    <div className="md:hidden flex items-center justify-between">
      <div className="h-5 w-28 rounded bg-white/10 animate-pulse" />
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
        <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
      </div>
    </div>
  </div>
);


