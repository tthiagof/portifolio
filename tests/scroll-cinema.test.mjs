import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createVideoScrubber, getSceneProgress } from '../src/scroll-cinema.js';

class VideoStub extends EventTarget {
  duration = 10;
  readyState = 1;
  seeking = false;
  time = 0;
  seeks = [];
  pause() {}
  get currentTime() { return this.time; }
  set currentTime(value) { this.time = value; this.seeking = true; this.seeks.push(value); }
  finishSeek() { this.seeking = false; this.dispatchEvent(new Event('seeked')); }
}

test('scene progress follows the pinned distance and clamps both ends', () => {
  assert.equal(getSceneProgress(250, 3000, 1000), 0);
  assert.equal(getSceneProgress(0, 3000, 1000), 0);
  assert.equal(getSceneProgress(-1000, 3000, 1000), .5);
  assert.equal(getSceneProgress(-2000, 3000, 1000), 1);
  assert.equal(getSceneProgress(-4000, 3000, 1000), 1);
  assert.equal(getSceneProgress(-100, 500, 500), 0);
});

test('fast scroll updates coalesce and scrolling back seeks backwards', () => {
  const video = new VideoStub();
  const scrubber = createVideoScrubber(video);
  scrubber.setProgress(.5);
  scrubber.setProgress(.7);
  scrubber.setProgress(.2);
  assert.equal(video.seeks.length, 1);
  video.finishSeek();
  assert.equal(video.seeks.length, 2);
  assert.ok(Math.abs(video.currentTime - 1.992) < .001);
  video.finishSeek();
  assert.equal(video.seeks.length, 2);
});

test('scrolling before metadata loads preserves the latest destination', () => {
  const video = new VideoStub(); video.readyState = 0; video.duration = NaN;
  const scrubber = createVideoScrubber(video);
  scrubber.setProgress(.8);
  assert.equal(video.seeks.length, 0);
  video.readyState = 1; video.duration = 5;
  video.dispatchEvent(new Event('loadedmetadata'));
  assert.ok(Math.abs(video.currentTime - 3.968) < .001);
});

test('reduced motion or hidden scenes stop seeks, then resume at the current position', () => {
  const video = new VideoStub();
  const scrubber = createVideoScrubber(video);
  scrubber.setEnabled(false); scrubber.setProgress(.9);
  assert.equal(video.seeks.length, 0);
  scrubber.setEnabled(true);
  assert.equal(video.seeks.length, 1);
  video.finishSeek();
  scrubber.destroy(); scrubber.setProgress(.1);
  assert.equal(video.seeks.length, 1);
});

test('a video failure stops further seek attempts', () => {
  const video = new VideoStub();
  const scrubber = createVideoScrubber(video);
  video.dispatchEvent(new Event('error'));
  scrubber.setProgress(1);
  assert.equal(video.seeks.length, 0);
});
