import { ThemeToggle } from "@/components/theme-toggle";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import { OmLogo } from "@/components/om-logo";

export function HomeHeader() {
  return (
    <header className="flex justify-between items-start mb-12">
      <div className="text-center flex-1">
        <OmLogo className="w-16 h-16 mb-4 mx-auto" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-accent-text">
          Mantrapurna
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Cultivate mindfulness and track your spiritual journey with intention and grace
        </p>
      </div>
      <div className="hidden md:flex items-center gap-4">
        <ThemeToggle />
        <UserProfileDropdown />
      </div>
    </header>
  );
}
