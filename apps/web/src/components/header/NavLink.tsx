import Link from 'next/link';
import { forwardRef, type ReactNode } from 'react';

interface Props {
  href: string;
  children: ReactNode;
}

export const NavLink = forwardRef<HTMLAnchorElement, Props>(
  function NavLink({ href, children }, ref) {
    return (
      <Link
        ref={ref}
        href={href}
        className="transition-colors hover:text-(--color-accent) focus-visible:outline-2 focus-visible:outline-offset-4 text-[16px]/[1.1] font-bold
                   tracking-normal text-(--color-ink)"
      >
        {children}
      </Link>
    );
  },
);
