import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import {
  EXPANDABLE_VIRTUAL_SCROLL_STRATEGY_CONFIG,
  ExpandableVirtualScrollStrategyService,
} from './expandable-virtual-scroll-strategy.service';

const collapsed = 50;
const expanded = 200;
const minBuffer = 100;
const maxBuffer = 200;

const buildViewport = (dataLength: number): CdkVirtualScrollViewport =>
  ({
    getDataLength: vi.fn(() => dataLength),
    getViewportSize: vi.fn(() => 600),
    measureScrollOffset: vi.fn(() => 0),
    setTotalContentSize: vi.fn(),
    setRenderedRange: vi.fn(),
    setRenderedContentOffset: vi.fn(),
    scrollToOffset: vi.fn(),
  }) as unknown as CdkVirtualScrollViewport;

const buildStrategy = (
  dataLength: number,
): { strategy: ExpandableVirtualScrollStrategyService; viewport: CdkVirtualScrollViewport } => {
  TestBed.configureTestingModule({
    providers: [
      ExpandableVirtualScrollStrategyService,
      {
        provide: EXPANDABLE_VIRTUAL_SCROLL_STRATEGY_CONFIG,
        useValue: {
          collapsedItemSize: collapsed,
          expandedItemSize: expanded,
          minBufferPx: minBuffer,
          maxBufferPx: maxBuffer,
        },
      },
    ],
  });
  const strategy = TestBed.inject(ExpandableVirtualScrollStrategyService);
  const viewport: CdkVirtualScrollViewport = buildViewport(dataLength);
  strategy.attach(viewport);
  return { strategy, viewport };
};

describe('ExpandableVirtualScrollStrategyService', () => {
  describe('without an expanded index', () => {
    it('should compute total content size as count * itemSize', () => {
      const { strategy } = buildStrategy(1000);
      expect(strategy.totalContentSize()).toBe(1000 * collapsed);
    });

    it('should compute offsetForIndex linearly', () => {
      const { strategy } = buildStrategy(1000);
      expect(strategy.offsetForIndex(0)).toBe(0);
      expect(strategy.offsetForIndex(10)).toBe(10 * collapsed);
      expect(strategy.offsetForIndex(999)).toBe(999 * collapsed);
    });

    it('should compute indexForOffset by floor division', () => {
      const { strategy } = buildStrategy(1000);
      expect(strategy.indexForOffset(0)).toBe(0);
      expect(strategy.indexForOffset(collapsed - 1)).toBe(0);
      expect(strategy.indexForOffset(collapsed)).toBe(1);
      expect(strategy.indexForOffset(10 * collapsed + 5)).toBe(10);
    });
  });

  describe('with an expanded index', () => {
    it('should add the size delta to the total content size', () => {
      const { strategy } = buildStrategy(1000);
      strategy.setExpandedIndex(50);
      expect(strategy.totalContentSize()).toBe(1000 * collapsed + (expanded - collapsed));
    });

    it('should not shift offsets before the expanded index', () => {
      const { strategy } = buildStrategy(1000);
      strategy.setExpandedIndex(50);
      expect(strategy.offsetForIndex(0)).toBe(0);
      expect(strategy.offsetForIndex(49)).toBe(49 * collapsed);
      expect(strategy.offsetForIndex(50)).toBe(50 * collapsed);
    });

    it('should shift offsets after the expanded index by the size delta', () => {
      const { strategy } = buildStrategy(1000);
      strategy.setExpandedIndex(50);
      const delta: number = expanded - collapsed;
      expect(strategy.offsetForIndex(51)).toBe(51 * collapsed + delta);
      expect(strategy.offsetForIndex(100)).toBe(100 * collapsed + delta);
    });

    it('should map an offset inside the expanded slot back to the expanded index', () => {
      const { strategy } = buildStrategy(1000);
      strategy.setExpandedIndex(50);
      const expandedStart: number = 50 * collapsed;
      expect(strategy.indexForOffset(expandedStart)).toBe(50);
      expect(strategy.indexForOffset(expandedStart + expanded - 1)).toBe(50);
      expect(strategy.indexForOffset(expandedStart + expanded)).toBe(51);
    });

    it('should reset shifts when index is set back to null', () => {
      const { strategy } = buildStrategy(1000);
      strategy.setExpandedIndex(50);
      strategy.setExpandedIndex(null);
      expect(strategy.totalContentSize()).toBe(1000 * collapsed);
      expect(strategy.offsetForIndex(100)).toBe(100 * collapsed);
    });

    it('should be a no-op when re-setting the same index', () => {
      const { strategy } = buildStrategy(1000);
      strategy.setExpandedIndex(10);
      const sizeBefore = strategy.totalContentSize();
      strategy.setExpandedIndex(10);
      expect(strategy.totalContentSize()).toBe(sizeBefore);
    });
  });

  describe('scrollToIndex', () => {
    it('should call scrollToOffset with the offset for that index', () => {
      const { strategy, viewport } = buildStrategy(100);
      strategy.setExpandedIndex(20);
      strategy.scrollToIndex(50, 'auto');
      expect(viewport.scrollToOffset).toHaveBeenCalledWith(
        50 * collapsed + (expanded - collapsed),
        'auto',
      );
    });
  });
});
