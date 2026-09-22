import type { ComponentProps } from "react";

type SchoolMarkProps = ComponentProps<"svg"> & {
  title?: string;
};

/** A compact vector version of the Aula+ school emblem. */
export function SchoolMark({ title, ...props }: SchoolMarkProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {title ? <title>{title}</title> : null}
      <path
        d="M8 30.5 29.5 14 51 30.5"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 29.5V54h34V29.5"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3.5 35h12M48.5 35h12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M15.5 35 9 27h-5.5M48.5 35 55 27h5.5"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26 54V43a6 6 0 0 1 12 0v11M20 35v9M29.5 35v9M39 35v9M48.5 35v9"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="25.5" r="5" stroke="currentColor" strokeWidth="3" />
      <path
        d="M32 22.4v3.5l2.3 1.3M32 14v-8h10.5v6.5H32"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
