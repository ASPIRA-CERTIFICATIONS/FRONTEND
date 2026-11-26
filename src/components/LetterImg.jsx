import { useState } from 'react';

/** Image that falls back to the copy on the old website if the local file is missing */
export default function LetterImg({ l, ...rest }) {
  const [src, setSrc] = useState(l.src);
  return <img src={src} onError={() => src !== l.fallback && setSrc(l.fallback)} width={l.width} height={l.height} {...rest} />;
}
