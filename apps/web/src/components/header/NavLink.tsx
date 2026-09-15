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
        className="cursor-default text-[16px]/[1.1] font-bold
                   text-(--color-ink)"
        style={{ letterSpacing: '0%' }}
      >
        {children}
      </Link>
    );
  },
);
