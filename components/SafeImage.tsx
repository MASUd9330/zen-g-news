'use client';
import { useState } from 'react';

const PLACEHOLDER = '/placeholder.svg';

export default function SafeImage({
  src,
  alt,
  seed,
  className,
  loading = 'lazy',
  sizes,
  categoryImage,
}: {
  src?: string | null;
  alt: string;
  seed?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  categoryImage?: string;
}) {
  const [errored, setErrored] = useState(false);

  // Priority: real src → category-specific Unsplash → Picsum → placeholder
  let finalSrc: string;
  if (src && !errored) {
    finalSrc = src;
  } else if (categoryImage && !errored) {
    finalSrc = categoryImage;
  } else if (seed) {
    finalSrc = `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/750`;
  } else {
    finalSrc = PLACEHOLDER;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      alt={alt}
      loading={loading}
      sizes={sizes}
      className={className}
      onError={() => setErrored(true)}
      referrerPolicy="no-referrer"
    />
  );
}
