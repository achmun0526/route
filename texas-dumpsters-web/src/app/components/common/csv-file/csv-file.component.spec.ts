/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CsvFileComponent } from './csv-file.component';

describe('CsvFileComponent', () => {
  let component: CsvFileComponent;
  let fixture: ComponentFixture<CsvFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsvFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsvFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
