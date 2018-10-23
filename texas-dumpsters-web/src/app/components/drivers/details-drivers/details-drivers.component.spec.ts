import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsDriversComponent } from './details-drivers.component';

describe('DetailsDriversComponent', () => {
  let component: DetailsDriversComponent;
  let fixture: ComponentFixture<DetailsDriversComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailsDriversComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsDriversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
