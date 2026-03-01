"use client"

interface CorrelationHeatmapProps {
    data: Array<{ name: string, [key: string]: string | number }>;
    assets: string[];
}

export default function CorrelationHeatmap({ data, assets }: CorrelationHeatmapProps) {
    if (!data || data.length === 0 || !assets || assets.length === 0) {
        return <div className="text-neutral-500 text-sm py-10 text-center">No correlation data available</div>;
    }

    const getColor = (value: number) => {
        // value ranges from -1 to 1
        // High correlation (1) = intense fuchsia
        // Neutral (0) = neutral dark
        // Negative (-1) = cyan 

        if (value > 0.8) return 'bg-fuchsia-500 text-white';
        if (value > 0.5) return 'bg-fuchsia-500/60 text-white';
        if (value > 0.2) return 'bg-fuchsia-500/30 text-white';
        if (value > -0.2 && value <= 0.2) return 'bg-neutral-800 text-neutral-300';
        if (value > -0.5) return 'bg-cyan-500/30 text-white';
        if (value > -0.8) return 'bg-cyan-500/60 text-white';
        return 'bg-cyan-500 text-white';
    };

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-fit">
                {/* Header Row */}
                <div className="flex">
                    <div className="w-16 h-10 flex items-center justify-center"></div>
                    {assets.map((asset) => (
                        <div key={asset} className="w-16 h-10 flex items-center justify-center text-xs font-semibold text-neutral-400">
                            {asset}
                        </div>
                    ))}
                </div>

                {/* Matrix Rows */}
                {data.map((row) => (
                    <div key={row.name} className="flex">
                        <div className="w-16 h-12 flex items-center justify-end pr-4 text-xs font-semibold text-neutral-400 border-r border-neutral-800">
                            {row.name}
                        </div>
                        {assets.map((asset) => {
                            const val = Number(row[asset]);
                            return (
                                <div key={`${row.name}-${asset}`} className="w-16 h-12 flex items-center justify-center p-1">
                                    <div className={`w-full h-full rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-medium transition-colors cursor-default hover:opacity-80 ${getColor(val)}`}>
                                        {val.toFixed(2)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-neutral-400">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-fuchsia-500"></div> +1.0</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-neutral-800"></div> 0.0</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-cyan-500"></div> -1.0</div>
            </div>
        </div>
    );
}
