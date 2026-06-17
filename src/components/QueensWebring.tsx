import React from 'react';

const WEBRING_BASE = 'https://queensu-webring.ca';
const CS_ICON = `${WEBRING_BASE}/assets/icons/cs/icon-white.png`;

interface QueensWebringProps {
  site: string;
  className?: string;
}

const QueensWebring: React.FC<QueensWebringProps> = ({ site, className = '' }) => {
  const webringUrl = `${WEBRING_BASE}/#${site}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <a
        href={`${webringUrl}?nav=prev`}
        className="text-white/70 hover:text-[var(--accent-color)] transition-colors text-base leading-none"
        aria-label="Previous site in Queen's Computing Webring"
      >
        ←
      </a>
      <a
        href={webringUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Queen's Computing Webring"
        className="group block leading-none"
      >
        <span
          aria-hidden="true"
          className="block w-7 h-7 sm:w-8 sm:h-8 bg-white/70 group-hover:bg-[var(--accent-color)] transition-all duration-300 group-hover:scale-110"
          style={{
            WebkitMaskImage: `url('${CS_ICON}')`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: `url('${CS_ICON}')`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
          }}
        />
      </a>
      <a
        href={`${webringUrl}?nav=next`}
        className="text-white/70 hover:text-[var(--accent-color)] transition-colors text-base leading-none"
        aria-label="Next site in Queen's Computing Webring"
      >
        →
      </a>
    </div>
  );
};

export default QueensWebring;
