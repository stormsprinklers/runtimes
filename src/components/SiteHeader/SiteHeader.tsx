"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { brand } from "@/lib/brand";
import {
  bookNowUrl,
  headerNav,
  servicesNav,
} from "@/lib/navigation";
import styles from "./SiteHeader.module.css";
import {
  CalendarBookIcon,
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
  PhoneIcon,
} from "./SiteHeaderIcons";

const PHONE_HREF = "tel:8017090681";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [spacerHeight, setSpacerHeight] = useState(150);
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

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const update = () => {
      setSpacerHeight(el.offsetHeight);
      document.documentElement.style.setProperty(
        "--header-h",
        `${el.offsetHeight}px`,
      );
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header ref={headerRef} className={styles.headerRoot}>
        <div className={styles.navBlock}>
          <div className={styles.inner}>
            <a
              className={styles.logoLink}
              aria-label="Storm Sprinklers home"
              href={brand.siteUrl}
            >
              <Image
                src="/logo.png"
                alt="Storm Sprinklers - Repair & Installation"
                width={272}
                height={139}
                className={styles.logoImg}
                priority
              />
            </a>

            <nav className={styles.desktopNav} aria-label="Main">
              <ul className={styles.desktopNavList}>
                <li className={styles.dropdownWrap} ref={servicesRef}>
                  <button
                    type="button"
                    className={styles.navLink}
                    aria-expanded={servicesOpen}
                    aria-haspopup="true"
                    onClick={() => setServicesOpen((o) => !o)}
                  >
                    Services
                    <ChevronDownIcon />
                  </button>
                  {servicesOpen && (
                    <ul className={styles.dropdown} role="menu">
                      {servicesNav.map((item) => (
                        <li key={item.href} role="none">
                          <a
                            href={item.href}
                            role="menuitem"
                            className={styles.dropdownLink}
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
                    <a className={styles.navLink} href={item.href}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.headerActions}>
              <div className={styles.mobileCtas}>
                <a
                  href={PHONE_HREF}
                  className={styles.iconBtnPink}
                  aria-label={`Call ${brand.phone}`}
                >
                  <PhoneIcon />
                </a>
                <a
                  className={styles.mobileBookBtn}
                  aria-label="Book Online"
                  href={bookNowUrl}
                >
                  <CalendarBookIcon />
                  Book Now
                </a>
              </div>

              <div className={styles.ctas}>
                <a className={styles.btnBook} href={bookNowUrl}>
                  Book Online
                  <CalendarBookIcon />
                </a>
                <a href={PHONE_HREF} className={styles.btnPhone}>
                  {brand.phone}
                  <PhoneIcon />
                </a>
              </div>

              <button
                type="button"
                className={styles.menuBtn}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((o) => !o)}
              >
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className={styles.drawer}>
              <ul className={styles.navList}>
                <li>
                  <span className={styles.navParent}>Services</span>
                  <ul>
                    {servicesNav.map((item) => (
                      <li key={item.href}>
                        <a href={item.href} onClick={() => setMenuOpen(false)}>
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                {headerNav.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} onClick={() => setMenuOpen(false)}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.breadcrumbWrap} />
      </header>

      <div
        className={styles.headerSpacer}
        style={{ height: spacerHeight }}
        aria-hidden
      />
    </>
  );
}
