import { brand } from "@/lib/brand";
import { footerSections } from "@/lib/navigation";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[var(--color-navy)] text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-2 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-4">
        {footerSections.map((section) => (
          <div key={section.title}>
            <h3 className="font-display mb-3 text-xs tracking-wide text-[var(--color-light-blue)] uppercase sm:mb-4 sm:text-sm">
              {section.title}
            </h3>
            <ul className="space-y-0.5">
              {section.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block py-2 text-sm leading-snug text-white/85 transition active:text-[var(--color-light-blue)] hover:text-[var(--color-light-blue)] sm:py-1.5"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="safe-bottom border-t border-white/15">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-display text-lg">Storm Sprinklers</p>
              <p className="mt-1 text-sm leading-relaxed text-white/80">
                {brand.address}
              </p>
              <p className="mt-2 flex flex-col gap-1 text-sm sm:flex-row sm:flex-wrap sm:gap-x-2">
                <a
                  href={`tel:${brand.phoneTel}`}
                  className="inline-block min-h-11 py-1 leading-10 hover:text-[var(--color-light-blue)] sm:min-h-0 sm:py-0 sm:leading-normal"
                >
                  {brand.phone}
                </a>
                <span className="hidden text-white/50 sm:inline">·</span>
                <a
                  href={`mailto:${brand.email}`}
                  className="break-anywhere inline-block min-h-11 py-1 leading-10 hover:text-[var(--color-light-blue)] sm:min-h-0 sm:py-0 sm:leading-normal"
                >
                  {brand.email}
                </a>
              </p>
              <p className="mt-1 text-xs text-white/60">{brand.license}</p>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-white/70">
              Proudly serving Utah County &amp; Salt Lake County | Licensed and
              Insured
            </p>
          </div>
          <p className="mt-5 text-center text-xs leading-relaxed text-white/50 sm:mt-6 sm:text-left">
            © {year} by Storm Sprinklers. Runtime calculator is an educational
            tool — always verify local watering ordinances.
          </p>
        </div>
      </div>
    </footer>
  );
}
