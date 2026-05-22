"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { brand } from "@/lib/brand";
import {
  bookNowUrl,
  headerNav,
  servicesNav,
} from "@/lib/navigation";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(e.target as Node)
      ) {
        setServicesOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-light-blue)] bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo.png"
            alt="Storm Sprinklers"
            width={160}
            height={48}
            className="h-10 w-auto sm:h-11"
            priority
          />
        </Link>

        <nav
          className="hidden items-center gap-5 lg:flex"
          aria-label="Main navigation"
        >
          <ul className="flex items-center gap-5">
            <li className="relative" ref={servicesRef}>
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-medium text-[var(--color-navy)] transition hover:text-[var(--color-medium-blue)]"
                aria-expanded={servicesOpen}
                aria-haspopup="true"
                onClick={() => setServicesOpen((o) => !o)}
              >
                Services
                <span aria-hidden className="text-xs">
                  ▼
                </span>
              </button>
              {servicesOpen && (
                <ul
                  className="absolute top-full left-0 mt-2 min-w-[240px] rounded-xl border border-[var(--color-light-blue)] bg-white py-2 shadow-lg"
                  role="menu"
                >
                  {servicesNav.map((item) => (
                    <li key={item.href} role="none">
                      <a
                        href={item.href}
                        role="menuitem"
                        className="block px-4 py-2 text-sm text-[var(--color-navy)] hover:bg-[var(--color-light-grey)]"
                        onClick={() => setServicesOpen(false)}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            {headerNav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-sm font-medium text-[var(--color-navy)] transition hover:text-[var(--color-medium-blue)]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={`tel:${brand.phoneTel}`}
            className="text-sm font-semibold text-[var(--color-navy)] hover:text-[var(--color-medium-blue)]"
          >
            {brand.phone}
          </a>
          <a
            href={bookNowUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-5 py-2 text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: brand.colors.pink }}
          >
            Book Now
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-light-blue)] text-[var(--color-navy)] lg:hidden"
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="text-xl">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[var(--color-light-blue)] bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3" aria-label="Mobile navigation">
            <p className="text-xs font-bold tracking-wide text-[var(--color-navy)]/50 uppercase">
              Services
            </p>
            {servicesNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="pl-2 text-sm text-[var(--color-navy)]"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <hr className="border-[var(--color-light-blue)]" />
            {headerNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-medium text-[var(--color-navy)]"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href={`tel:${brand.phoneTel}`}
              className="font-semibold text-[var(--color-navy)]"
            >
              {brand.phone}
            </a>
            <a
              href={bookNowUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full px-5 py-2 text-center font-bold text-white"
              style={{ background: brand.colors.pink }}
            >
              Book Now
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
