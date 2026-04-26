import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: "root",
  })
export class sweetalert  {

    constructor(
        private translateService: TranslateService ,

        ) { 
        } 

        SaveSuccess()
        {
            Swal.fire({
                text: this.translateService.instant('SaveSuccess'),
                icon: 'success',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#0081ff'

            })
            
        }

        

        relaySuccess()
        {
            Swal.fire({
                text: this.translateService.instant('relaySuccess'),
                icon: 'success',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#0081ff'

            })
            
        }


        ErrSave()
        {
            Swal.fire({
                text: this.translateService.instant('ErrSave'),
                icon: 'error',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#0081ff'

            })
            
        }
        unrelaySuccess()
        {
            Swal.fire({
                text: this.translateService.instant('unrelaySuccess'),
                icon: 'success',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#0081ff'

            })
            
        }
        ValidationVisitClosedAlert()
        {
            Swal.fire({
                text: this.translateService.instant('ValidationVisitClosedAlert'),
                icon: 'success',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#0081ff'

            })
            
        }
        DeleteSuccess()
        {
            Swal.fire({
                text: this.translateService.instant('DeleteSuccess'),
                icon: 'success',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#0081ff'

            })
            
        }
        UpdateSuccess()
        {
            Swal.fire({
                text: this.translateService.instant('UpdateSuccessful'),
                icon: 'success',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#0081ff'

            })
            
        }
    SaveFaild()
    {

        Swal.fire({
            text: this.translateService.instant('SaveFalid'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
    PleaseEnterAssest()
    {

        Swal.fire({
            text: this.translateService.instant('PleaseEnterAssest'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
    CanntSameLocation()
    {

        Swal.fire({
            text: this.translateService.instant('CanntSameLocation'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
    CanntSameAssestID()
    {

        Swal.fire({
            text: this.translateService.instant('CanntSameAssestID'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
    PleaseSelectedPatient()
    {

        Swal.fire({
            text: this.translateService.instant('PleaseSelectedPatient'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
    PleaseSelectedBookRef()
    {

        Swal.fire({
            text: this.translateService.instant('PleaseSelectedBookRef'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
    claimReq()
    {

        Swal.fire({
            text: this.translateService.instant('claimReq'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
    pleaseAddAtLeastOneSession()
    {

        Swal.fire({
            text: this.translateService.instant('pleaseAddAtLeastOneSession'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
    saveFileFirst()
    {

        Swal.fire({
            text: this.translateService.instant('saveFileFirst'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
    visitIDValidation()
    {

        Swal.fire({
            text: this.translateService.instant('visitIDValidation'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
    DeleteFaild()
    {

        Swal.fire({
            text: this.translateService.instant('DeleteFaild'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }

    UpdateFaild()
    {

        Swal.fire({
            text: this.translateService.instant('UpdateFaild'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }

    DeleteFaildcant()
    {

        Swal.fire({
            text: this.translateService.instant('msgRecordHasLinks'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
    discountMustBeLess()
    {

        Swal.fire({
            text: this.translateService.instant('discountMustBeLess'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
    SaveFaildFieldRequired() //for BackEnd
    {

        Swal.fire({
            text: this.translateService.instant('RequiredField'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
    MustEnterEmployeeID() //for BackEnd
    {

        Swal.fire({
            text: this.translateService.instant('MustEnterEmployeeID'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
    MustSelectOriginalconditionuponreceipt() //for BackEnd
    {

        Swal.fire({
            text: this.translateService.instant('MustSelectOriginalconditionuponreceipt'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
    DeleteFaildInvoice()
    {

        Swal.fire({
            text: this.translateService.instant('DeleteFaildInvoice'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }

    patientAccFaild()
    {

        Swal.fire({
            text: this.translateService.instant('patientAccFaild'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
    EmrBilServiceDetailsMsgError()
    {

        Swal.fire({
            text: this.translateService.instant('EmrBilServiceDetailsMsgError'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
    PermissinsFail()
    {
        Swal.fire({
        text: this.translateService.instant('PermissinsFail'),
        icon: 'warning',
        confirmButtonText:this.translateService.instant('Ok'),
        confirmButtonColor:'#6e7881'
        })

    }
    SaveScheduleTypes()
        {
            Swal.fire({
                text: this.translateService.instant('SaveSuccess'),
                icon: 'success',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#0081ff'

            }).then((result) => {
                // Reload the Page
                location.reload();
              });
            
        }



        SaveFaildRequired(message="")
        {
    
            Swal.fire({
                title:this.translateService.instant('RequiredField'),
                text: message,
                icon: 'error',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#dc3741'
            })
        }
        SaveFaildDueToOtherFunctions()
        {
    
            Swal.fire({
                text: this.translateService.instant('SaveFaildDueToOtherFunctions'),
                icon: 'error',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#dc3741'
            })
        }
        settlementLabsError() 
        {
    
            Swal.fire({
                text: this.translateService.instant('thereIsNoExtLabs'),
                icon: 'error',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#dc3741'
            })
        }
        pleaseFillTheSettings()
        {
    
            Swal.fire({
                text: this.translateService.instant('pleaseFillTheSettings'),
                icon: 'error',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#dc3741'
            })
        }
        pleaseEnterWorkDays()
        {
    
            Swal.fire({
                text: this.translateService.instant('pleaseEnterWorkDays'),
                icon: 'error',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#dc3741'
            })
        }
        WorkDaysUsedBefore()
        {
    
            Swal.fire({
                text: this.translateService.instant('WorkDaysUsedBefore'),
                icon: 'error',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#dc3741'
            })
        }
        GeneralWarningMessage(message:string)
        {
            Swal.fire({
            text: this.translateService.instant(message),
            icon: 'warning',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#0081ff'
            })
    
        }
        CustomSaveSuccess(Message)
        {
            Swal.fire({
                text: this.translateService.instant(Message),
            })
            
        }
        SaveSessionStatusConfirmed()
        {
            Swal.fire({
                text: this.translateService.instant('SaveSessionStatusConfirmed'),
                icon: 'success',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#0081ff'

            })
            
        }
        ChangedSessionStatus()
        {
            Swal.fire({
                text: this.translateService.instant('ChangedSessionStatus'),
                icon: 'success',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#0081ff'

            })
            
        }
        SaveSessionStatusCanceled()
        {
            Swal.fire({
                text: this.translateService.instant('SaveSessionStatusCanceled'),
                icon: 'success',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#0081ff'

            })
            
        }
        
        CheckTheFinancial()
        {
    
            Swal.fire({
                text: this.translateService.instant('CheckTheFinancial'),
                icon: 'error',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#dc3741'
            })
        }
        inValidDates()
        {
    
            Swal.fire({
                text: this.translateService.instant('ToDateValidation'),
                icon: 'error',
                confirmButtonText:this.translateService.instant('Ok'),
                confirmButtonColor:'#dc3741'
            })
        }

    CloseMonthErrorMsg()
    {

        Swal.fire({
            text: this.translateService.instant('CloseMonthErrorMsg'),
            icon: 'error',
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }
 
    ShowAlert(msgText,icon)
    {
        if(icon=='')
            icon='error';
        Swal.fire({
            text: this.translateService.instant(msgText),
            icon: icon,
            confirmButtonText:this.translateService.instant('Ok'),
            confirmButtonColor:'#dc3741'
        })
    }


    RemainimgQty(msgText , Number , icon)
    {       
        if(icon=='')
        icon='error';
        Swal.fire({
        text: `${this.translateService.instant(msgText) + " " + Number}` ,//,
        icon: icon,
        confirmButtonText:this.translateService.instant('Ok'),
        confirmButtonColor:'#dc3741'
    })
    }

    ShowAlert4Fields(msgText , text1 , text2, icon)
    {       
        if(icon=='')
        icon='error';
        Swal.fire({
        text: `${this.translateService.instant(msgText) + text1 + text2}` ,//,
        icon: icon,
        confirmButtonText:this.translateService.instant('Ok'),
        confirmButtonColor:'#dc3741'
    })
    }
}
 


