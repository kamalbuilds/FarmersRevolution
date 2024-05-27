import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="bg-background border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          {siteConfig.name} © 2024
        </p>
      </div>
    </footer>
  );
}
