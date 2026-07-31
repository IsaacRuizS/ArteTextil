/**
 * Ordena alfabéticamente cualquier lista que tenga `fullName`.
 *
 * Se usa `localeCompare` con locale 'es' para que las tildes y la "ñ" queden
 * en el orden correcto (Núñez después de Nunez, Á junto a A, etc.).
 * Devuelve una copia: no muta el arreglo original.
 */
export function sortUsersByName<T extends { fullName?: string }>(users: T[]): T[] {

    return [...users].sort((a, b) =>
        (a.fullName ?? '').localeCompare(b.fullName ?? '', 'es', { sensitivity: 'base' })
    );
}
