/** File upload: attach a file with setInputFiles and verify the result. */
import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('File Upload', { tag: '@regression' }, () => {

  test.beforeEach(async ({ uploadPage }) => { await uploadPage.goto(); });

  test('shows the selected file name', async ({ uploadPage }) => {
    // A synthetic in-memory file — no fixture file on disk required.
    await uploadPage.chooseFile({
      name: 'report.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('id,name\n1,Ada'),
    });
    expect(await uploadPage.getFileName()).toContain('report.csv');
  });

  test('uploads the chosen file successfully', { tag: '@smoke' }, async ({ uploadPage }) => {
    await uploadPage.chooseFile({
      name: 'screenshot.png',
      mimeType: 'image/png',
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    });
    await uploadPage.upload();
    expect(await uploadPage.getSuccessMessage()).toContain('screenshot.png');
  });

});
