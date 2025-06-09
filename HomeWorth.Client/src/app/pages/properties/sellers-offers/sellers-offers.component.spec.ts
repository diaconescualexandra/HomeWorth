import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellersOffersComponent } from './sellers-offers.component';

describe('SellersOffersComponent', () => {
  let component: SellersOffersComponent;
  let fixture: ComponentFixture<SellersOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellersOffersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellersOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
