export class AppFormErrors {
    common: any[] = [];
    fields: {[key: string]: any}[] = [];

    assignServerFieldErrors(errors: { [key: string]: any}[]) {
        this.fields = [];

        if (errors) {
            for (const key in errors) {

                if (errors.hasOwnProperty(key)){
                    this.fields.push({name: key, messages: errors[key]});
                }
            }
        }
    }
}
