import React from 'react';

export interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    fillColor?: string;
    strokeWidth?: number;
    showArea?: boolean;
    showDots?: boolean;
    showLastDot?: boolean;
    trend?: 'up' | 'down' | 'neutral';
    className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
    data,
    width = 100,
    height = 30,
    color,
    fillColor,
    strokeWidth = 2,
    showArea = false,
    showDots = false,
    showLastDot = true,
    trend,
    className = '',
}) => {
    const gradientId = React.useId().replace(/:/g, '');

    if (!data || data.length === 0) {
        return null;
    }

    // Determine trend if not provided
    const calculatedTrend = trend || (data[data.length - 1] >= data[0] ? 'up' : 'down');

    // Default colors based on trend
    const defaultColor = calculatedTrend === 'up'
        ? 'rgb(52, 199, 89)' // status-success
        : calculatedTrend === 'down'
            ? 'rgb(255, 59, 48)' // status-error
            : 'rgb(0, 122, 255)'; // accent-blue

    const strokeColor = color || defaultColor;

    // Calculate min and max values
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // Avoid division by zero

    // Calculate points
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return { x, y, value };
    });

    // Create path for line
    const linePath = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`)
        .join(' ');

    // Create path for area (if enabled)
    const areaPath = showArea
        ? `${linePath} L ${width},${height} L 0,${height} Z`
        : '';

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className={`sparkline ${className}`}
            preserveAspectRatio="none"
            style={{ display: 'block', width: '100%', height: '100%' }}
        >
            <defs>
                <linearGradient id={`gradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Area fill */}
            {showArea && (
                <path
                    d={areaPath}
                    fill={`url(#gradient-${gradientId})`}
                    stroke="none"
                />
            )}

            {/* Line */}
            <path
                d={linePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Dots */}
            {showDots && points.map((point, index) => (
                <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r={strokeWidth}
                    fill={strokeColor}
                />
            ))}

            {/* Last dot (highlighted) */}
            {showLastDot && points.length > 0 && (
                <g>
                    <circle
                        cx={points[points.length - 1].x}
                        cy={points[points.length - 1].y}
                        r={strokeWidth * 2}
                        fill="white"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                    />
                </g>
            )}
        </svg>
    );
};

export default Sparkline;
