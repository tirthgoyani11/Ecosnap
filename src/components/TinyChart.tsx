import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface DataPoint {
  month: string;
  scans: number;
  co2Saved: number;
}

interface TinyChartProps {
  data: DataPoint[];
  type?: 'line' | 'area';
  color?: string;
  height?: number;
  animated?: boolean;
}

export function TinyChart({ 
  data, 
  type = 'area', 
  color = 'hsl(var(--primary))', 
  height = 60,
  animated = true 
}: TinyChartProps) {
  const pathData = useMemo(() => {
    if (!data.length) return '';
    
    const width = 200;
    const maxValue = Math.max(...data.map(d => d.scans));
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d.scans / maxValue) * (height - 10);
      return `${x},${y}`;
    });
    
    if (type === 'line') {
      return `M ${points.join(' L ')}`;
    } else {
      // Area chart
      const firstPoint = points[0];
      const lastPoint = points[points.length - 1];
      const [lastX] = lastPoint.split(',');
      const [firstX] = firstPoint.split(',');
      
      return `M ${firstX},${height} L ${points.join(' L ')} L ${lastX},${height} Z`;
    }
  }, [data, height, type]);

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 200 ${height}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        
        {animated ? (
          <motion.path
            d={pathData}
            fill={type === 'area' ? `url(#${gradientId})` : 'none'}
            stroke={color}
            strokeWidth={type === 'line' ? 2 : 1.5}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        ) : (
          <path
            d={pathData}
            fill={type === 'area' ? `url(#${gradientId})` : 'none'}
            stroke={color}
            strokeWidth={type === 'line' ? 2 : 1.5}
          />
        )}
        
        {/* Data points */}
        {data.map((_, i) => {
          const x = (i / (data.length - 1)) * 200;
          const y = height - (data[i].scans / Math.max(...data.map(d => d.scans))) * (height - 10);
          
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={2}
              fill={color}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: animated ? i * 0.1 + 0.5 : 0,
                duration: 0.3,
                ease: "easeOut"
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}