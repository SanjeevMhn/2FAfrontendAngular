import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormErrHelperService {
  constructor() {}
  getErrMsgs(label: string, control: any) {
    let msg = null;
    if (control !== null) {
      Object.keys(control).map((key) => {
        if (key == 'required') {
          msg = `${label} is required`;
        }
        if (key == 'email') {
          msg = `${label} not valid`;
        }
        if (key == 'minlength') {
          msg = `${label} must be atleast ${control[key]['requiredLength']} characters long`;
        }
        
      });
    }

    return msg;
  }

  getFormErrMsg(control: any){
    let msg = null;
    if(control !== null && control.errors !== null){
      Object.keys(control.errors).map(key => {
        if (key == 'confirm_password') {
          msg = `Passwords do not match`;
        }
      })
    }

    return msg;
  }
}
