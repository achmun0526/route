import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveDriversComponent } from './save-drivers.component';

describe('SaveDriversComponent', () => {
  let component: SaveDriversComponent;
  let fixture: ComponentFixture<SaveDriversComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveDriversComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveDriversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
