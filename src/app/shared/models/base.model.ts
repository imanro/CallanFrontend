export abstract class CallanBaseModel {
    id: number;

    isLoaded?(): boolean {
        return this.id !== undefined;
    }

    isNew?(): boolean {
        return this.id === undefined;
    }
}


