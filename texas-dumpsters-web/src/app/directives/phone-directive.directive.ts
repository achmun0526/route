import { Directive, HostListener, ElementRef, OnInit } from '@angular/core';
import { PhoneNumberPipe } from '../pipes/phone-number.pipe';

@Directive({
  selector: '[appPhoneDirective]'
})
export class PhoneDirectiveDirective {

	private el: any;

  constructor(private elementRef: ElementRef,private phoneNumber: PhoneNumberPipe) {
		 this.el = this.elementRef.nativeElement;
	}

	ngOnInit() {
    this.el.value = this.phoneNumber.transform(this.el.value);
  }

	@HostListener("focus", ["$event.target.value"])
		onFocus(value) {
			this.el.value = this.phoneNumber.transform(value); // opossite of transform
		}

	@HostListener("blur", ["$event.target.value"])
	onBlur(value) {
		this.el.value = this.phoneNumber.transform(value);
	}

}
