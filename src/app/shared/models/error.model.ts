export class AppError {

    error?: any;
    message: string;
    httpStatus?: number;
    code?: number;
    formErrors?: any[];

    constructor(message?) {
        if (message) {
            this.message = message;
        }
    }
}
