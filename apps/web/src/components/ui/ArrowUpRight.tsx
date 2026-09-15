interface Props {
  className?: string;
}

export function ArrowUpRight({ className = '' }: Props) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <path
        d="M5.5 16.5L16.5 5.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5625 5.5H16.5V14.4375"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
