import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveIncidentComponent } from './save-incident.component';

describe('SaveIncidentComponent', () => {
  let component: SaveIncidentComponent;
  let fixture: ComponentFixture<SaveIncidentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveIncidentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveIncidentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
