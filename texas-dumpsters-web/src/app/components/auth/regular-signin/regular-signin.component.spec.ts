import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularSigninComponent } from './regular-signin.component';

describe('RegularSigninComponent', () => {
  let component: RegularSigninComponent;
  let fixture: ComponentFixture<RegularSigninComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegularSigninComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegularSigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
