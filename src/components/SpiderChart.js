import React from 'react';

const SpiderChart = ({ data, size = 200, maxValue = null }) => {
  const center = size / 2;
  const radius = size * 0.35;
  const numberOfAxes = Object.keys(data).length;

  if (numberOfAxes === 0) return null;

  // Calculate max value if not provided
  const calculatedMaxValue = maxValue || Math.max(...Object.values(data), 1);

  // Generate points for each axis
  const axes = Object.keys(data).map((label, index) => {
    const angle = (index * 2 * Math.PI) / numberOfAxes - Math.PI / 2; // Start from top
    return {
      label,
      angle,
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      value: data[label] || 0
    };
  });

  // Generate grid circles (background rings)
  const gridLevels = 5;
  const gridCircles = Array.from({ length: gridLevels }, (_, i) => {
    const levelRadius = (radius * (i + 1)) / gridLevels;
    return levelRadius;
  });

  // Generate data polygon points
  const dataPoints = axes.map(axis => {
    const valueRatio = axis.value / calculatedMaxValue;
    const dataRadius = radius * valueRatio;
    const x = center + dataRadius * Math.cos(axis.angle);
    const y = center + dataRadius * Math.sin(axis.angle);
    return `${x},${y}`;
  });

  const dataPolygon = dataPoints.join(' ');

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background grid circles */}
        {gridCircles.map((levelRadius, index) => (
          <circle
            key={index}
            cx={center}
            cy={center}
            r={levelRadius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
            opacity={0.5}
          />
        ))}

        {/* Axis lines */}
        {axes.map((axis, index) => (
          <line
            key={index}
            x1={center}
            y1={center}
            x2={axis.x}
            y2={axis.y}
            stroke="#e5e7eb"
            strokeWidth="1"
            opacity={0.5}
          />
        ))}

        {/* Data area */}
        {dataPoints.length > 0 && (
          <polygon
            points={dataPolygon}
            fill="rgba(249, 115, 22, 0.2)"
            stroke="#f97316"
            strokeWidth="2"
          />
        )}

        {/* Data points */}
        {axes.map((axis, index) => {
          const valueRatio = axis.value / calculatedMaxValue;
          const dataRadius = radius * valueRatio;
          const x = center + dataRadius * Math.cos(axis.angle);
          const y = center + dataRadius * Math.sin(axis.angle);
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="#f97316"
              stroke="white"
              strokeWidth="2"
            />
          );
        })}

        {/* Axis labels */}
        {axes.map((axis, index) => {
          const labelDistance = radius + 20;
          const labelX = center + labelDistance * Math.cos(axis.angle);
          const labelY = center + labelDistance * Math.sin(axis.angle);
          
          // Calculate text anchor based on position
          let textAnchor = 'middle';
          if (labelX > center + 5) textAnchor = 'start';
          else if (labelX < center - 5) textAnchor = 'end';

          return (
            <text
              key={index}
              x={labelX}
              y={labelY}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              className="text-xs font-medium fill-gray-700"
              fontSize="12"
            >
              {axis.label}
            </text>
          );
        })}

        {/* Value labels on points */}
        {axes.map((axis, index) => {
          if (axis.value === 0) return null;
          
          const valueRatio = axis.value / calculatedMaxValue;
          const dataRadius = radius * valueRatio;
          const x = center + dataRadius * Math.cos(axis.angle);
          const y = center + dataRadius * Math.sin(axis.angle);
          
          return (
            <text
              key={`value-${index}`}
              x={x}
              y={y - 8}
              textAnchor="middle"
              className="text-xs font-bold fill-primary-600"
              fontSize="10"
            >
              {axis.value}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default SpiderChart;
