import { brand } from "@/lib/brand";
import { footerSections } from "@/lib/navigation";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[var(--color-navy)] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {footerSections.map((section) => (
          <div key={section.title}>
            <h3 className="font-display mb-4 text-sm tracking-wide text-[var(--color-light-blue)] uppercase">
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/85 transition hover:text-[var(--color-light-blue)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-display text-lg">Storm Sprinklers</p>
              <p className="mt-1 text-sm text-white/80">{brand.address}</p>
              <p className="mt-1 text-sm">
                <a
                  href={`tel:${brand.phoneTel}`}
                  className="hover:text-[var(--color-light-blue)]"
                >
                  {brand.phone}
                </a>
                {" · "}
                <a
                  href={`mailto:${brand.email}`}
                  className="hover:text-[var(--color-light-blue)]"
                >
                  {brand.email}
                </a>
              </p>
              <p className="mt-1 text-xs text-white/60">{brand.license}</p>
            </div>
            <p className="max-w-md text-sm text-white/70">
              Proudly serving Utah County &amp; Salt Lake County | Licensed and
              Insured
            </p>
          </div>
          <p className="mt-6 text-center text-xs text-white/50 sm:text-left">
            © {year} by Storm Sprinklers. Runtime calculator is an educational
            tool — always verify local watering ordinances.
          </p>
        </div>
      </div>
    </footer>
  );
}
