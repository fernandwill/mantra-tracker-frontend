import { ThemeToggle } from "@/components/theme-toggle";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";

export function MobileControls() {
  return (
    <div className="flex justify-end items-center gap-3 mb-4 md:hidden">
      <ThemeToggle />
      <UserProfileDropdown />
    </div>
  );
}
