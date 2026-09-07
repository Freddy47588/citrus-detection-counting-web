import type { DetectionItem } from "../types/detection";

interface DetectionViewerProps {
  imageUrl: string;
  width: number;
  height: number;
  detections: DetectionItem[];
}

const boxStyle = { stroke: "#2f7d4a", fill: "#2f7d4a" };

export function DetectionViewer({ imageUrl, width, height, detections }: DetectionViewerProps) {
  const strokeWidth = Math.max(width, height) * 0.003;
  const fontSize = Math.max(width, height) * 0.018;

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-[#eef0ea]">
      <img src={imageUrl} alt="Citrus detection result" className="block h-auto w-full" />
      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 h-full w-full" aria-label={`${detections.length} detected citrus fruit bounding boxes`}>
        {detections.map((detection, index) => {
          const { x1, y1, x2, y2 } = detection.bbox;
          const color = boxStyle;
          const label = `${detection.class_name} ${(detection.confidence * 100).toFixed(1)}%`;
          const labelWidth = Math.min(width - x1, label.length * fontSize * 0.58 + fontSize);
          const labelY = Math.max(0, y1 - fontSize * 1.45);
          return (
            <g key={`${detection.class_id}-${index}`}>
              <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} fill="none" stroke={color.stroke} strokeWidth={strokeWidth} />
              <rect x={x1} y={labelY} width={labelWidth} height={fontSize * 1.45} fill={color.fill} opacity="0.94" />
              <text x={x1 + fontSize * 0.35} y={labelY + fontSize} fill="white" fontSize={fontSize} fontFamily="Inter, sans-serif" fontWeight="700">{label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
