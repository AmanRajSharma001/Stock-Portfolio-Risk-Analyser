"use client"

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface MonteCarloChartProps {
    data: {
        representativePaths: number[][]; // array of price paths
        worstCase5: number;
        expectedValue: number;
    };
}

export default function MonteCarloChart({ data }: MonteCarloChartProps) {
    if (!data || !data.representativePaths || data.representativePaths.length === 0) {
        return <div className="text-neutral-500 text-sm py-10 text-center">No simulation data available</div>;
    }

    const { representativePaths, worstCase5, expectedValue } = data;

    // Transform rows of paths into array of day objects {"day": 0, "path1": 100, "path2": ...}
    const chartData = useMemo(() => {
        const result = [];
        const days = representativePaths[0].length;
        for (let day = 0; day < days; day++) {
            const dayObj: any = { day };
            representativePaths.forEach((path, i) => {
                dayObj[`path${i}`] = path[day];
            });
            result.push(dayObj);
        }
        return result;
    }, [representativePaths]);

    return (
        <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis
                        dataKey="day"
                        stroke="#737373"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={20}
                        tickFormatter={(v) => `${v}d`}
                    />
                    <YAxis
                        stroke="#737373"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px', display: 'none' }}
                    // Hiding tooltip because 5 paths are visually noisy, we just want the aggregate references
                    />

                    {/* Render random paths with low opacity */}
                    {representativePaths.map((_, i) => (
                        <Line
                            key={`path${i}`}
                            type="monotone"
                            dataKey={`path${i}`}
                            stroke="#d946ef" // fuchsia
                            strokeWidth={1.5}
                            opacity={0.3}
                            dot={false}
                            isAnimationActive={true}
                            animationDuration={2000}
                        />
                    ))}

                    <ReferenceLine y={worstCase5} label={{ position: 'insideTopLeft', value: '5% Worst Case (VaR)', fill: '#ef4444', fontSize: 12 }} stroke="#ef4444" strokeDasharray="3 3" />
                    <ReferenceLine y={expectedValue} label={{ position: 'insideTopLeft', value: 'Expected Mean', fill: '#10b981', fontSize: 12 }} stroke="#10b981" strokeDasharray="3 3" />

                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
