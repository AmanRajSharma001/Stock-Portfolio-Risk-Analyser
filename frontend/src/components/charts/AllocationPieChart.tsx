"use client"

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface AllocationPieChartProps {
    data: { symbol: string, weight: number, allocationAmount: number }[];
}

export default function AllocationPieChart({ data }: AllocationPieChartProps) {
    if (!data || data.length === 0) return <div className="text-neutral-500 text-sm py-10 text-center">No allocation data available</div>;

    // Vibrant Hackathon Palette matching the rest of the app
    const COLORS = ['#f43f5e', '#d946ef', '#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6'];

    const formattedData = useMemo(() => {
        return data.map(d => ({
            name: d.symbol,
            value: d.allocationAmount,
            weight: d.weight
        }));
    }, [data]);

    return (
        <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={formattedData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        isAnimationActive={true}
                        animationDuration={1500}
                    >
                        {formattedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px' }}
                        itemStyle={{ color: '#f8fafc' }}
                        formatter={(value: number | undefined, name: string | undefined, props: any) => [
                            `$${(value || 0).toFixed(2)} (${(props.payload.weight * 100).toFixed(1)}%)`,
                            name || 'Asset'
                        ]}
                        labelStyle={{ display: 'none' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
