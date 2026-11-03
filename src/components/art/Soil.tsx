import { INK, SOIL, SOIL_DEEP, GREEN, SAGE } from './palette';

/** An earthen mound with pebbles and grass tufts, centred on (cx, cy) at its top surface. */
export function Soil({ cx = 0, cy = 0, width = 180, tufts = true }: { cx?: number; cy?: number; width?: number; tufts?: boolean }) {
  const w = width / 2;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <path
        d={`M${-w},18 C${-w * 0.7},-2 ${-w * 0.3},-8 0,-8 C${w * 0.3},-8 ${w * 0.7},-2 ${w},18 Z`}
        fill={SOIL}
        stroke={INK}
        strokeOpacity={0.5}
        strokeWidth={1}
      />
      <path d={`M${-w * 0.8},14 C${-w * 0.5},4 ${w * 0.4},2 ${w * 0.78},13`} fill="none" stroke={SOIL_DEEP} strokeWidth={1} opacity={0.5} />
      {[
        [-0.5, 6, 2.2],
        [-0.15, 9, 1.4],
        [0.35, 7, 1.8],
        [0.6, 11, 1.2],
        [-0.7, 12, 1.5],
      ].map(([fx, y, r], i) => (
        <circle key={i} cx={fx * w} cy={y} r={r} fill={SOIL_DEEP} opacity={0.55} />
      ))}
      {tufts &&
        [-0.85, -0.62, 0.66, 0.9].map((fx, i) => (
          <g key={i} transform={`translate(${fx * w} ${10 - Math.abs(fx) * 4})`}>
            {[-8, -2, 5].map((a, j) => (
              <path
                key={j}
                d={`M0,4 Q${a * 0.4},-6 ${a},${-12 - j * 2}`}
                fill="none"
                stroke={j === 1 ? GREEN : SAGE}
                strokeWidth={1.6}
                strokeLinecap="round"
              />
            ))}
          </g>
        ))}
    </g>
  );
}
