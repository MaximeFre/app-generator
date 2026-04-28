import { useMemo } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Path, Rect, G } from "react-native-svg";
import { cn } from "@/lib/utils";

/**
 * Lightweight chart primitive built on react-native-svg only — no chart lib.
 *
 * Each `kind` expects a different `data` shape. The component is a tagged
 * union so TS narrows on `kind`.
 *
 * - "line": data: number[]                       — connected line series.
 * - "bar":  data: number[]                       — vertical bars.
 * - "ring": data: { value: number; max: number } — single ring/donut.
 * - "sparkline": data: number[]                  — minimal trend line.
 * - "heatmap": data: { date: string; value: number }[] — calendar grid.
 *
 * Color uses `var(--color-primary)` — matches dark/light tokens automatically
 * on web; on native, we resolve it to a hex via the prop fallback the caller
 * passes (or the default literal). Prefer letting the default ride.
 */

type CommonProps = {
  width: number;
  height: number;
  className?: string;
  testID?: string;
  /** Override the primary color. Pass a CSS color string. */
  color?: string;
  /** Override the muted/track color (for ring + heatmap empty cells). */
  trackColor?: string;
};

type LineChartProps = CommonProps & { kind: "line"; data: number[] };
type BarChartProps = CommonProps & { kind: "bar"; data: number[] };
type RingChartProps = CommonProps & { kind: "ring"; data: { value: number; max: number } };
type SparklineProps = CommonProps & { kind: "sparkline"; data: number[] };
type HeatmapProps = CommonProps & {
  kind: "heatmap";
  data: { date: string; value: number }[];
};

export type ChartProps =
  | LineChartProps
  | BarChartProps
  | RingChartProps
  | SparklineProps
  | HeatmapProps;

// On RN, react-native-svg doesn't resolve `var(...)` at runtime — provide a
// fallback that matches our default light-theme primary (rgb(15 23 42)).
// Callers can override via `color`. The fallback for `trackColor` matches the
// muted token (rgb(241 245 249)).
const DEFAULT_COLOR = "rgb(15, 23, 42)";
const DEFAULT_TRACK = "rgba(15, 23, 42, 0.1)";

function buildLinePath(values: number[], width: number, height: number, padding: number) {
  if (values.length === 0) return "";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const stepX = values.length > 1 ? innerW / (values.length - 1) : 0;

  return values
    .map((v, i) => {
      const x = padding + i * stepX;
      const y = padding + innerH - ((v - min) / range) * innerH;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function Chart(props: ChartProps) {
  const { width, height, className, testID } = props;
  const color = props.color ?? DEFAULT_COLOR;
  const trackColor = props.trackColor ?? DEFAULT_TRACK;

  const content = useMemo(() => {
    switch (props.kind) {
      case "line": {
        const padding = 8;
        const d = buildLinePath(props.data, width, height, padding);
        return <Path d={d} stroke={color} strokeWidth={2} fill="none" />;
      }
      case "sparkline": {
        const padding = 2;
        const d = buildLinePath(props.data, width, height, padding);
        return <Path d={d} stroke={color} strokeWidth={1.5} fill="none" />;
      }
      case "bar": {
        const padding = 8;
        const innerW = width - padding * 2;
        const innerH = height - padding * 2;
        const max = Math.max(...props.data, 1);
        const gap = 4;
        const barW =
          props.data.length > 0
            ? Math.max(2, (innerW - gap * (props.data.length - 1)) / props.data.length)
            : 0;
        return (
          <G>
            {props.data.map((v, i) => {
              const h = (v / max) * innerH;
              const x = padding + i * (barW + gap);
              const y = padding + (innerH - h);
              return (
                <Rect
                  key={i}
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx={2}
                  fill={color}
                />
              );
            })}
          </G>
        );
      }
      case "ring": {
        const stroke = 8;
        const radius = Math.min(width, height) / 2 - stroke;
        const cx = width / 2;
        const cy = height / 2;
        const circumference = 2 * Math.PI * radius;
        const pct = Math.min(1, Math.max(0, props.data.value / Math.max(1, props.data.max)));
        const offset = circumference * (1 - pct);
        return (
          <G>
            <Circle cx={cx} cy={cy} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={color}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          </G>
        );
      }
      case "heatmap": {
        // 7-row weekday grid, columns = weeks. Sized to fit `width`.
        const cellGap = 2;
        const rows = 7;
        const cols = Math.max(1, Math.ceil(props.data.length / rows));
        const cellSize = Math.max(
          2,
          Math.min(
            (width - cellGap * (cols - 1)) / cols,
            (height - cellGap * (rows - 1)) / rows,
          ),
        );
        const max = Math.max(...props.data.map((d) => d.value), 1);
        return (
          <G>
            {props.data.map((d, i) => {
              const col = Math.floor(i / rows);
              const row = i % rows;
              const x = col * (cellSize + cellGap);
              const y = row * (cellSize + cellGap);
              const intensity = d.value / max;
              const fill = d.value === 0 ? trackColor : color;
              const opacity = d.value === 0 ? 1 : 0.25 + intensity * 0.75;
              return (
                <Rect
                  key={`${d.date}-${i}`}
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  fill={fill}
                  opacity={opacity}
                />
              );
            })}
          </G>
        );
      }
      default: {
        // Exhaustive — TS will narrow this branch as `never`.
        const _exhaustive: never = props;
        return _exhaustive;
      }
    }
  }, [props, width, height, color, trackColor]);

  // Suppress unused import lint when only some kinds are used in a build.
  void Line;

  return (
    <View testID={testID} className={cn(className)}>
      <Svg width={width} height={height}>
        {content}
      </Svg>
    </View>
  );
}
