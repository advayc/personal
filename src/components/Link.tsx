import React, { ReactNode } from "react";

interface LinkProps {
  href: string;
  children: ReactNode;
}

const Link: React.FC<LinkProps> = ({ href, children }) => {
  return (
    <a href={href} target="_blank" className="text-primary underline decoration-1 underline-offset-2 decoration-dashed hover:text-cyan-400 transition duration-300">
      {children}
    </a>
  );
};

export default Link;