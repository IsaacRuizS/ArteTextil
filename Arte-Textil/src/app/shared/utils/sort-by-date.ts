/**
 * Ordena una lista de más reciente a más antiguo.
 *
 * Por defecto usa `createdAt`, que es el criterio estándar de todos los
 * listados del sistema. Se puede pasar otro campo para las entidades que no
 * exponen `createdAt` en su DTO (por ejemplo los pagos, que usan `paymentDate`).
 *
 * Los registros sin fecha quedan al final en vez de mezclarse arriba.
 * Devuelve una copia: no muta el arreglo original.
 */
export function sortByDateDesc<T>(
    items: T[],
    field: keyof T | ((item: T) => unknown) = 'createdAt' as keyof T
): T[] {

    const getValue = typeof field === 'function'
        ? field
        : (item: T) => item[field];

    const toTime = (item: T): number => {

        const value = getValue(item);

        if (value === null || value === undefined || value === '') return -Infinity;

        const time = new Date(value as any).getTime();

        return isNaN(time) ? -Infinity : time;
    };

    return [...items].sort((a, b) => toTime(b) - toTime(a));
}
