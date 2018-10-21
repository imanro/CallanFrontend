import {CallanFormErrors} from '../models/form-errors.model';
import {FormControl, FormGroup} from '@angular/forms';

export class CallanFormHelper {

    static bindErrors(errors: CallanFormErrors, form: FormGroup, fieldMap?: any, skipFields?: any): any[] {

        let unmapped = [];

        for (const fieldError of errors.fields) {

            const fieldName = CallanFormHelper.getFieldName(fieldError.name, fieldMap);
            if (skipFields && skipFields[fieldName] !== undefined){
                unmapped.push(fieldError.messages.join(', '));
                continue;
            }

            const input = form.get(fieldName);

            if (!input || !(input instanceof FormControl)) {
                console.error('There is no such input', fieldName, 'in this form, could not bind an error');
                unmapped.push(fieldError.messages.join(', '));
                continue;
            } else {
                input.setErrors({'server': fieldError.messages.join(', ')});
            }
        }

        unmapped = unmapped.concat(errors.common);
        return unmapped;
    }

    static getFieldName(name, fieldMap: any) {
        if (fieldMap && fieldMap[name]) {
            return fieldMap[name];
        } else {

            let matches;
            if (matches = /^.+?\./.exec(name)) {
                console.log('found', matches);
                if (fieldMap && fieldMap[matches[0]]) {
                    return name.replace(matches[0], fieldMap[matches[0]]);
                } else {
                    return name;
                }
            } else {
                return name;
            }
        }

    }

    static addFormError(errors: CallanFormErrors, field: string, message: string) {

        for (const checkField of errors.fields) {
            if (checkField.name === field) {
                checkField.messages.push(message);
                return;
            }
        }

        errors.fields.push({name: field, messages: [message]});
    }
}
