import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'customCurrency',
    standalone: true
})
export class CustomCurrencyPipe implements PipeTransform {

    transform(
        value: number | string,
        symbol: string = '₡'
    ): string {

        if (value === null || value === undefined) return `${symbol}0`;

        const num = Number(value);
        if (isNaN(num)) return `${symbol}0`;

        // Formato con espacio como separador de miles
        const formatted = num
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

        return `${symbol}${formatted}`;
    }
}
