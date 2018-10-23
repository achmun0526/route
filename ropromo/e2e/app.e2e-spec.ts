import { SuperiorFenceWebPage } from './app.po';

describe('superior-fence-web App', function() {
  let page: SuperiorFenceWebPage;

  beforeEach(() => {
    page = new SuperiorFenceWebPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
