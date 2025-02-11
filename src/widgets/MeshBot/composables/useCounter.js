import { computed } from 'vue';
import {useCounterStore} from "@/widgets/MeshBot/stores/counter";

export default function useCounter() {
    const counterStore = useCounterStore();

    // Функция для увеличения счётчика
    const increment = () => {
        counterStore.count++;
    };

    // Функция для уменьшения счётчика
    const decrement = () => {
        counterStore.count--;
    };

    // Вычисляемое свойство, например, удвоенное значение счётчика
    const double = computed(() => counterStore.count * 2);

    return {
        // Оборачиваем count в computed, чтобы обеспечить реактивность при деструктуризации
        count: computed(() => counterStore.count),
        increment,
        decrement,
        double,
    };
}
