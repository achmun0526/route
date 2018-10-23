import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Attachment} from "../../../model/attachment";
import {AttachmentsService} from "../../../services/attachments/attachments.service";
import {OUT_DIR} from "webdriver-manager/built/lib/cmds";

@Component({
  selector: 'app-list-attachments',
  templateUrl: './list-attachments.component.html',
  styleUrls: ['./list-attachments.component.css']
})
export class ListAttachmentsComponent  implements OnInit {

  private filesList:Attachment[]=[];
  private totalFiles:number=0;
  @Input() entityKey;
  @Output() onCloseAction = new EventEmitter();

  constructor(private attachmentsServices:AttachmentsService) { }



  ngOnInit() {
    this.attachmentsServices.getAttachmentsByEntityId(this.entityKey).then(res =>{
      console.log("res ",res);
      this.filesList=res;
      this.totalFiles=this.filesList.length;
    });
  }

  /**
   *
   * */
  private openPopup(url){
    window.open(url,'_blank');
  }

}
