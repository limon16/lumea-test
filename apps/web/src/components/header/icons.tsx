interface IconProps {
  className?: string;
}

const commonProps = {
  viewBox: '0 0 22 22',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 0.6875,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className}>
      <path d="M9.96875 17.1875C13.9556 17.1875 17.1875 13.9556 17.1875 9.96875C17.1875 5.98194 13.9556 2.75 9.96875 2.75C5.98194 2.75 2.75 5.98194 2.75 9.96875C2.75 13.9556 5.98194 17.1875 9.96875 17.1875Z" />
      <path d="M15.0728 15.0732L19.2494 19.2499" />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className}>
      <path
        d="M11.001 18.5625C11.001 18.5625 2.40723 13.75 2.40723 7.90626C2.4074 6.8734 2.76529 5.87249 3.42004 5.07368C4.07479 4.27488 4.98599 3.7275 5.99872 3.5246C7.01145 3.3217 8.06319 3.47581 8.97513 3.96072C9.88708 4.44564 10.6029 5.23143 11.001 6.1845L11.001 6.18451C11.399 5.23144 12.1149 4.44564 13.0268 3.96073C13.9388 3.47581 14.9905 3.3217 16.0032 3.5246C17.016 3.7275 17.9272 4.27488 18.5819 5.07368C19.2367 5.87249 19.5946 6.8734 19.5947 7.90626C19.5947 13.75 11.001 18.5625 11.001 18.5625Z"
      />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className}>
      <circle cx="11" cy="7" r="3.75" />
      <path d="M3.5 19c1.2-3.7 4.4-5.75 7.5-5.75S17.8 15.3 19 19" />
    </svg>
  );
}

export function CartIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className}>
      <path d="M16.5 15.8125H5.88627C5.72527 15.8125 5.56937 15.756 5.44576 15.6528C5.32214 15.5497 5.23866 15.4064 5.20986 15.248L2.91514 2.62702C2.88634 2.46861 2.80285 2.32533 2.67924 2.22217C2.55563 2.11901 2.39973 2.0625 2.23873 2.0625H0.6875" />
      <path d="M6.1875 19.25C7.13674 19.25 7.90625 18.4805 7.90625 17.5312C7.90625 16.582 7.13674 15.8125 6.1875 15.8125C5.23826 15.8125 4.46875 16.582 4.46875 17.5312C4.46875 18.4805 5.23826 19.25 6.1875 19.25Z" />
      <path d="M16.5 19.25C17.4492 19.25 18.2188 18.4805 18.2188 17.5312C18.2188 16.582 17.4492 15.8125 16.5 15.8125C15.5508 15.8125 14.7812 16.582 14.7812 17.5312C14.7812 18.4805 15.5508 19.25 16.5 19.25Z" />
      <path d="M3.4375 5.5H18.4262C18.5269 5.5 18.6264 5.52212 18.7176 5.5648C18.8088 5.60748 18.8895 5.66967 18.9541 5.74698C19.0186 5.8243 19.0653 5.91484 19.091 6.01221C19.1167 6.10958 19.1207 6.21141 19.1026 6.31048L17.9776 12.498C17.9488 12.6564 17.8654 12.7997 17.7417 12.9028C17.6181 13.006 17.4622 13.0625 17.3012 13.0625H4.8125" />
    </svg>
  );
}

export function BurgerIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className}>
      <path d="M3.4375 11H18.5625" />
      <path d="M3.4375 5.5H18.5625" />
      <path d="M3.4375 16.5H18.5625" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} strokeWidth={1.5} className={className}>
      <path d="M4.5 4.5l13 13" />
      <path d="M17.5 4.5l-13 13" />
    </svg>
  );
}
