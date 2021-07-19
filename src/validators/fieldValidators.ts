import {ErrorType, FieldsType} from "../types/types";

export const fieldValidators = (fields: FieldsType): ErrorType =>{
    let errors: ErrorType = {};

    if(fields.name.length>200){
        errors = {
            ...errors,
            nameError: 'Name can not be more then 200 symbols'
        }
    }

    if(fields.description.length>1000){
        errors = {
            ...errors,
            descriptionError: 'Description can not be more then 1000 symbols'
        }
    }

    return errors;
}
