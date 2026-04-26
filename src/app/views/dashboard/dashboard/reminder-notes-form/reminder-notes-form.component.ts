import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DashboardComponent } from '../dashboard.component';
import { formatDate } from '@angular/common';
import { sweetalert } from 'sweetalert';
import { ReminderNotesService } from './reminder-notes.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reminder-notes-form',
  templateUrl: './reminder-notes-form.component.html',
  styleUrls: ['./reminder-notes-form.component.scss']
})
export class ReminderNotesFormComponent implements OnInit {
public showLoader: boolean;
public loading: boolean;
public selectedColor: string = '';
public ReminderNotesForm: FormGroup;
reminderNoteList: any[] = [];
public desc: string;


  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private formbulider: FormBuilder,
  public dialogRef: MatDialogRef<DashboardComponent>,
  private alert: sweetalert,
  private ReminderNotesService: ReminderNotesService,
  public router: Router,) { }

  ngOnInit(): void {
    this.ReminderNotesForm = this.formbulider.group({
      id         :[0 || this.data.id],
      userId     :[0],
      descr      : ["",Validators.required],  
      stampDate  :[new Date()],
      noteColor  : [""], 
    });
    this.GetAllReminderNotes();
  }

  GetAllReminderNotes() {
    debugger
    this.ReminderNotesService.getReminderNoteinfo(this.data.id).subscribe((results: any) => {
      debugger
      this.ReminderNotesForm.value.noteColor = results.noteColor;
      this.selectedColor = results.noteColor;
      this.ReminderNotesForm.patchValue(results); 
    })
  }

  changeColor(color: any){
    debugger
    this.selectedColor = color;
  }

  OnSaveForms(){
    debugger
   this.ReminderNotesForm.value.stampDate = new Date();
  // this.ReminderNotesForm.value.stampDate = formatDate(this.ReminderNotesForm.value.stampDate, "dd-MM-yyyy HH:mm:ss" , "en-US" );
   this.ReminderNotesForm.value.noteColor =  this.selectedColor;

   this.ReminderNotesService.saveReminderNotesForm(this.ReminderNotesForm.value).subscribe((result) => {
    debugger
      if(result.isSuccess == true)
      {
        this.alert.SaveSuccess();
        this.data.GetAllReminderNotes();
        this.dialogRef.close(result);
      }
      else{
        this.alert.SaveFaild(); 
      }
   });
  }

}
