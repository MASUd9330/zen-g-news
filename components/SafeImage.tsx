'use client';
import { useState } from 'react';

const PLACEHOLDER = '/placeholder.svg';

function picsumUrl(seed: string, w = 1200, h = 750) {
  // Picsum gives a deterministic random image based on the seed
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

export default function SafeImage({
  src,
  alt,
  seed,
  className,
  loading = 'lazy',
  sizes,
}: {
  src?: string | null;
  alt: string;
  seed?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}) {
  const [errored, setErrored] = useState(false);
  const fallback = seed ? picsumUrl(seed) : PLACEHOLDER;
  const finalSrc = !src || errored ? fallback : src;

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
