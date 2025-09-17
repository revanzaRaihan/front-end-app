// import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b border-gray-200 bg-green-50 transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1 text-green-700 hover:text-green-800" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-6" />
        <h1 className="text-lg font-semibold text-green-700">Dashboard</h1>
        {/* Placeholder untuk action button lain di kanan, bisa ditambah nanti */}
        <div className="ml-auto flex items-center gap-2"></div>
      </div>
    </header>
  );
}
