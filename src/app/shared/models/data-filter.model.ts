export class AppDataFilter {
    limit: number;
    offset: number;
    // filter.order = {name: 'Asc'}
    order: {[index: string]: string};
    where: any;

    getPage(isZeroBased = true): number {
        const add = isZeroBased ? 0 : 1;
        if (this.offset) {
            return Math.round(this.offset / this.limit) + add;
        } else {
            return add;
        }
    }
}
