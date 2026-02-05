import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

    transform(value: string, limit: number = 150, completeWords: boolean = false, ellipsis: string = '...'): string {
        if (value?.length <= limit) {
            return value;
        }

        return `${value.slice(0, limit - 3)}${ellipsis}`;
    }

}