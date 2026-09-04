'use client';
import { useState } from 'react';

const PLACEHOLDER = '/placeholder.svg';

export default function SafeImage({
  src,
  alt,
  className,
  loading = 'lazy',
  sizes,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}) {
  const [errored, setErrored] = useState(false);
  const finalSrc = !src || errored ? PLACEHOLDER : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      alt={alt}
      loading={loading}
      sizes={sizes}
      className={className}
      onError={() => setErrored(true)}
    />
  );
}
