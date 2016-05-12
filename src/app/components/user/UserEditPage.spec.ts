import {Observable} from "rxjs/Observable";
import {Component, provide, DebugElement} from "@angular/core";
import {inject, beforeEachProviders, beforeEach} from "@angular/core/testing";
import {
  ROUTER_PRIMARY_COMPONENT,
  ROUTER_DIRECTIVES
} from "@angular/router-deprecated";
import {By} from "@angular/platform-browser/src/dom/debug/by";
import {getDOM} from "@angular/platform-browser/src/dom/dom_adapter";
import {BaseResponseOptions, Response} from "@angular/http";
import {UserEditPage, App} from "app/components";
import {APP_TEST_PROVIDERS} from "app/providers";
import {TestContext, createTestContext, signin} from "app/testing";
import {UserService} from "app/services";
import {User} from "app/interfaces";

describe('UserEditPage', () => {

  var ctx:TestContext;
  var cmpDebugElement:DebugElement;
  var userService:UserService;

  const user:User = {id: 1, email: "test@test.com", name: "test user"};

  beforeEachProviders(() => [
    APP_TEST_PROVIDERS,
    provide(ROUTER_PRIMARY_COMPONENT, {useValue: App}),
  ]);
  beforeEach(createTestContext(_ => ctx = _));

  beforeEach(inject([UserService], _userService => {
    userService = _userService;
    spyOn(_userService, 'get').and.returnValue(Observable.of(user));
  }));
  beforeEach(signin(user));
  beforeEach(done => {
    ctx.init(TestCmp)
      .finally(done)
      .subscribe();
  });
  beforeEach(done => {
    ctx.router.navigate(['/MeEdit']).then(() => {
      ctx.fixture.detectChanges();
      cmpDebugElement = ctx.fixture.debugElement.query(By.directive(UserEditPage));
      done();
    });
  });

  it('can be shown', () => {
    expect(cmpDebugElement).toBeTruthy();
    const cmp:UserEditPage = cmpDebugElement.componentInstance;
    expect(cmp.user).toEqual(user);

    const el = cmpDebugElement.nativeElement;
    const nameInput = <HTMLInputElement>getDOM().querySelector(el, '#nameInput');
    expect(nameInput.value).toEqual('test user');

    const emailInput = <HTMLInputElement>getDOM().querySelector(el, '#emailInput');
    expect(emailInput.value).toEqual('test@test.com');

    const passwordInput = <HTMLInputElement>getDOM().querySelector(el, '#passwordInput');
    expect(passwordInput.value).toEqual('');

    const passwordConfirmationInput = <HTMLInputElement>
      getDOM().querySelector(el, '#passwordConfirmationInput');
    expect(passwordConfirmationInput.value).toEqual('');
  });

  it('can validate inputs', () => {
    const cmp:UserEditPage = cmpDebugElement.componentInstance;
    expect(cmp.myForm.valid).toBeTruthy();
    cmp.name.updateValue('a', {});
    cmp.email.updateValue('b', {});
    cmp.password.updateValue('c', {});
    cmp.passwordConfirmation.updateValue('d', {});
    expect(cmp.myForm.valid).toBeFalsy();
    cmp.name.updateValue('akira', {});
    cmp.email.updateValue('test@test.com', {});
    cmp.password.updateValue('secret123', {});
    cmp.passwordConfirmation.updateValue('secret123', {});
    expect(cmp.myForm.valid).toBeTruthy();
  });

  it('can edit my profile', () => {
    const cmp:UserEditPage = cmpDebugElement.componentInstance;
    spyOn(userService, 'updateMe').and.callThrough();
    ctx.backend.connections.subscribe(conn => {
      conn.mockRespond(new Response(new BaseResponseOptions()));
    });
    cmp.onSubmit({
      email: 'test@test.com',
      password: 'secret123',
      passwordConfirmation: 'secret123',
      name: '',
    });
    expect(userService.updateMe).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'secret123',
      passwordConfirmation: 'secret123',
    });
  });

});

@Component({
  selector: 'test-cmp',
  template: `<router-outlet></router-outlet>`,
  directives: [ROUTER_DIRECTIVES],
})
class TestCmp {
}
