import { HomeControlClientPage } from './app.po';

describe('home-control-client App', () => {
  let page: HomeControlClientPage;

  beforeEach(() => {
    page = new HomeControlClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
