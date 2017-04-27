import { HelloAngularFirePage } from './app.po';

describe('hello-angular-fire App', function() {
  let page: HelloAngularFirePage;

  beforeEach(() => {
    page = new HelloAngularFirePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
