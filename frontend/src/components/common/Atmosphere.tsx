import { useMemo } from 'react'
import type { CSSProperties } from 'react'

export default function Atmosphere() {
  const particles = useMemo(() => Array.from({ length: 18 }, (_, i) => {
    const css = {
      '--x': `${(i * 47 + 13) % 100}%`,
      '--y': `${(i * 61 + 9) % 100}%`,
      '--size': `${i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1}px`,
      '--delay': `${(i % 9) * -1.7}s`,
      '--duration': `${19 + (i % 8) * 3}s`,
    } as CSSProperties
    return <i key={i} style={css} />
  }), [])

  return <div className="ambient-environment" aria-hidden="true">
    <div className="ambient-aurora" />
    <div className="ambient-vignette" />
    <div className="ambient-orbit ambient-orbit-a"><i /></div>
    <div className="ambient-orbit ambient-orbit-b"><i /></div>
    <div className="ambient-orbit ambient-orbit-c" />
    <div className="ambient-energy-trail" />
    <div className="ambient-particles">{particles}</div>
    <div className="ambient-grid" />
  </div>
}
