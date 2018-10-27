import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { CompaniesService } from '../../../services/companies/companies.service';
import { isNullOrUndefined} from "util";
import { AuthService } from '../../../services/auth/auth.service';
import { CsvService } from '../../../services/csv/csv.service';

@Component({
  selector: 'app-csv-file',
  templateUrl: './csv-file.component.html',
  styleUrls: ['./csv-file.component.css']
})
export class CsvFileComponent implements OnInit {


	private file;
	private company_key;
	private title;
	@Input() entity;
	@Output() reloadData = new EventEmitter();
	//add CSV file modal
	private CSVModal = new EventEmitter<string|MaterializeAction>();
	//add CSV file toasts
	private addCsvToast = new EventEmitter<string|MaterializeAction>();
	private addCsvToastError = new EventEmitter<string|MaterializeAction>();

	private message = "";
	private errors = "";
	private errorsClean;
	private errorsArray = [];
	private errorModal = new EventEmitter<string|MaterializeAction>();

  constructor(private authService:AuthService,private csvService:CsvService) {
		this.file = {};
	}

  ngOnInit() {
		this.company_key = this.authService.getCurrentSelectedCompany().id;
  }

	/** function to add  csv file**/
	addCVSfile(data){
    console.log("beginning of addCVSfile");
		this.file = {};
		this.file.entity = this.entity;
		this.file.company_key = this.authService.getCurrentSelectedCompany().id;
		var keyList = Object.keys(data);

		for( var i = 0; i < keyList.length ;i++){
			var key = keyList[i]
			this.file[key]= data[key];
		}
		this.title = this.entity;
		this.openCSVModal();
	}

	saveCsv(){
    console.log("inside saveCsv");
		this.errors = "";
    console.log(this.file);
		this.csvService.addCSVfile(this.file).then(res=>{
			if(res != null){
				var ok_rows = res.total_inserted_rows;
				var fail_rows = res.total_errors_rows;

				if(fail_rows == 0){
					this.message = "CSV file imported succesfully";
				}else{
					this.message = "fail: " + fail_rows + "ok: " + ok_rows;
					this.errors = res.errors;
					this.errorsClean = this.errors.replace(/\"/g, "").replace(/\[/g, "").replace(/\}/g, "").replace(/, /g, "").replace(/\]/g, "").replace(/\{/g, "").replace(/\^\:\ /g, "");
					console.log("CSV errors: ", this.errors);
					this.errorsArray = this.errorsClean.split("%");
					this.openErrorModal();
				}
				this.showMessageToast();
        this.reloadData.emit();
			}else{
				this.addCsvToastError.emit('toast');
			}
		});
		this.closeCSVModal();
	}
	/**
   * file functions
   *
   * */
  uploadFile(){
    console.log("upload csv function");
    var temp = (<any>document.getElementById('CSV_file'));
    if (isNullOrUndefined(temp) || isNullOrUndefined(temp.files[0])){
			this.addCsvToastError.emit('toast');
      return;
    }
    var file = temp.files[0];
    var reader = new FileReader();
    reader.onload = (e) => {
      var base64String=reader.result;
      console.log("csv file reader");
      console.log(base64String);
      base64String=base64String.split(',')[1];
      console.log(base64String);
      this.saveFile(base64String,file);
    }
    reader.onerror = (e) => {
			this.addCsvToastError.emit('toast');
    };
    reader.readAsDataURL(file);
  }

  saveFile(base64String,file){
    console.log("inside saveFile");
    base64String = (base64String + '===').slice(0, base64String.length + (base64String.length % 4));
    console.log("sliced base64String");
    console.log(base64String);
    base64String.replace(/-/g, '+').replace(/_/g, '/');
		//this.file.logo_name = file.name;
		this.file.file = base64String;
		this.saveCsv();
  }


	/** modals functions **/
	openCSVModal() {
    this.CSVModal.emit({action:"modal",params:['open']});
  }
  closeCSVModal() {
    this.CSVModal.emit({action:"modal",params:['close']});
	}

	showMessageToast() {
		setTimeout(() => {
      this.addCsvToast.emit('toast');
    }, 100);

	}

  openErrorModal(){
    setTimeout(() => {
      this.errorModal.emit({action:'modal',params:['open']})
    }, 100);
	}

  closeErrorModal(){
    this.errorModal.emit({action:'modal',params:['close']});
  }

}
