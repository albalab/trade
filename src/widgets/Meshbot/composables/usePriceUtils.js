export function usePriceUtils() {
    const roundToStep = (value, step) => Math.round(value / step) * step;
    return { roundToStep };
}
