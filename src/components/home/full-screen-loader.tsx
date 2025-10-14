import { OmLogo } from "@/components/om-logo";

export function FullScreenLoader() {
  return (
    <div className="min-h-screen gradient-surface flex items-center justify-center">
      <div className="text-center">
        <OmLogo className="w-16 h-16 mb-4 animate-pulse mx-auto" />
      </div>
    </div>
  );
}
