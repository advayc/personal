import React, { ReactNode } from "react";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  className?: string;
}

const Link: React.FC<LinkProps> = ({ href, children, className, target, rel, ...props }) => {
  const resolvedTarget = target ?? "_blank";
  const resolvedRel = rel ?? (resolvedTarget === "_blank" ? "noopener noreferrer" : undefined);

  return (
    <a
      href={href}
      target={resolvedTarget}
      rel={resolvedRel}
      className={`text-primary underline decoration-1 underline-offset-2 decoration-dashed hover:text-[var(--accent-color)] transition duration-300 ${className ?? ''}`}
      {...props}
    >
      {children}
    </a>
  );
};

export default Link;