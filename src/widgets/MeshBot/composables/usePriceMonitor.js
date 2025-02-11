import { ref, onMounted, onUnmounted } from 'vue';
import { useMeshbotStore } from '@/widgets/MeshBot/stores/meshbotStore';
import { useDataFabricStore } from '@/stores/dataFabricStore';

export default function usePriceMonitor(botName) {
    const priceMonitor = ref(null);

    const meshbotStore = useMeshbotStore();
    const dataFabricStore = useDataFabricStore();

    const startPriceMonitor = () => {
        if (priceMonitor.value) return;

        priceMonitor.value = setInterval(() => {
            const bot = meshbotStore.bots.find(b => b.name === botName);
            if (!bot) return;

            const dataFabric = dataFabricStore.lastValues.data;
            if (!dataFabric || !dataFabric[bot.ticker]) return;

            const newPrice = dataFabric[bot.ticker].oBestBidPrice * 100;
            meshbotStore.updateBotSetting(bot.name, 'initialPrice', Number(newPrice.toFixed(0)));
        }, 200);

        //console.log('Start price monitor');
    };

    const stopPriceMonitor = () => {
        if (priceMonitor.value) {
            clearInterval(priceMonitor.value);
            priceMonitor.value = null;
            //console.log('Stop price monitor');
        }
    };

    onMounted(startPriceMonitor);
    onUnmounted(stopPriceMonitor);

    return {
        startPriceMonitor,
        stopPriceMonitor,
    };
}
