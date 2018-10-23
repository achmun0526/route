/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SavePricingComponent } from './save-pricing.component';

describe('SavePricingComponent', () => {
  let component: SavePricingComponent;
  let fixture: ComponentFixture<SavePricingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavePricingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavePricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
