import test from 'node:test';
import assert from 'node:assert/strict';
import { createPreviewLink } from '../preview.js';

test('creates a memorable preview shortcut from a valid destination', () => {
  assert.equal(createPreviewLink('https://example.com/very/long/path', '  Team-Roadmap  '), 'go/team-roadmap');
});

test('rejects destinations that cannot be opened as web links', () => {
  assert.throws(() => createPreviewLink('javascript:alert(1)', 'roadmap'), /http or https/);
  assert.throws(() => createPreviewLink('not a url', 'roadmap'), /valid destination/);
});

test('rejects shortcuts that are hard to share or use', () => {
  assert.throws(() => createPreviewLink('https://example.com', 'two words'), /1–32/);
  assert.throws(() => createPreviewLink('https://example.com', '-start'), /1–32/);
  assert.throws(() => createPreviewLink('https://example.com', 'a'.repeat(33)), /1–32/);
});
