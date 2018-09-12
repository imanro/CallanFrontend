export class CallanCustomer {
    id: number;
    email: string;
    firstName: string;
    lastName: string;

    isLoaded?(): boolean {
        return this.id !== undefined;
    }

    isNew?(): boolean {
        return this.id === undefined;
    }
}
