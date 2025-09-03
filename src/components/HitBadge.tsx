import React from 'react';

interface HitBadgeProps { id: string; label?: string; color?: string; className?: string }

const HitBadge: React.FC<HitBadgeProps> = ({ id, label = 'views', color = 'blue', className = '' }) => {
  const url = `${process.env.NEXT_PUBLIC_HIT_COUNTER_URL || 'https://nums.advay.ca/'}/badge?id=${encodeURIComponent(id)}&label=${encodeURIComponent(label)}&color=${encodeURIComponent(color)}`;
  return <img src={url} alt={`${label} badge`} className={className} />;
};

export default HitBadge;
