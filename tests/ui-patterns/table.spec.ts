/** Data table: sorting, filtering, and pagination. */
import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Data Table', { tag: '@regression' }, () => {

  test.beforeEach(async ({ tablePage }) => { await tablePage.goto(); });

  test('shows the first page of results', async ({ tablePage }) => {
    expect(await tablePage.getRowCount()).toBe(5);
    expect(await tablePage.getPageInfo()).toContain('Page 1 of 3');
  });

  test('filtering narrows the rows', async ({ tablePage }) => {
    await tablePage.filter('Engineer');
    const names = await tablePage.getNames();
    expect(names.length).toBeGreaterThan(0);
    expect(await tablePage.getPageInfo()).toContain('results');
  });

  test('sorting by score orders ascending then descending', async ({ tablePage }) => {
    await tablePage.sortByScore();
    const asc = await tablePage.getScores();
    expect(asc).toEqual([...asc].sort((a, b) => a - b));

    await tablePage.sortByScore();  // toggle
    const desc = await tablePage.getScores();
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  test('pagination moves between pages', async ({ tablePage }) => {
    await tablePage.nextPage();
    expect(await tablePage.getPageInfo()).toContain('Page 2 of 3');
    await tablePage.prevPage();
    expect(await tablePage.getPageInfo()).toContain('Page 1 of 3');
  });

});
