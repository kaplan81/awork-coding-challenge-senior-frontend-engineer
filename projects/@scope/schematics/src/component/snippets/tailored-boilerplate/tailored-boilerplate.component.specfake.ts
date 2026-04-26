import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TailoredBoilerplateComponent } from './tailored-boilerplate.component';

describe('TailoredBoilerplateComponent', () => {
  let fixture: ComponentFixture<TailoredBoilerplateComponent>;
  // Remove component let variable if not needed.
  let component: TailoredBoilerplateComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TailoredBoilerplateComponent] }).compileComponents();
    fixture = TestBed.createComponent(TailoredBoilerplateComponent);
    component = fixture.componentInstance;
  });

  it('should match snapshot', async () => {
    await fixture.whenStable();
    expect(component).toMatchSnapshot();
  });

  describe('firstComponentPublicMethod()', () => {
    it('should...', () => {
      expect(true).toBe(true);
    });
  });
});
