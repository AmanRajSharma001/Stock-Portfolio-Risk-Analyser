import * as math from 'mathjs';

export const calculateCorrelation = (returnsA, returnsB) => {
    const meanA = math.mean(returnsA);
    const meanB = math.mean(returnsB);

    let num = 0, denA = 0, denB = 0;
    for (let i = 0; i < returnsA.length; i++) {
        const diffA = returnsA[i] - meanA;
        const diffB = returnsB[i] - meanB;
        num += diffA * diffB;
        denA += diffA * diffA;
        denB += diffB * diffB;
    }

    if (denA === 0 || denB === 0) return 0;
    return num / Math.sqrt(denA * denB);
};

export const generateCorrelationMatrix = (assetsReturnsArray, assetNames) => {
    const matrix = [];
    for (let i = 0; i < assetsReturnsArray.length; i++) {
        const row = { name: assetNames[i] };
        for (let j = 0; j < assetsReturnsArray.length; j++) {
            // Recharts scatter/heatmap prefers flat data or matrix of objects
            row[assetNames[j]] = calculateCorrelation(assetsReturnsArray[i], assetsReturnsArray[j]);
        }
        matrix.push(row);
    }
    return matrix;
};

