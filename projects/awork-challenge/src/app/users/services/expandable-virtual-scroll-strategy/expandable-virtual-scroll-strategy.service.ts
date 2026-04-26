import { CdkVirtualScrollViewport, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, Subject, distinctUntilChanged } from 'rxjs';

import { ExpandableVirtualScrollStrategyConfig } from '../../models/expandable-virtual-scroll-strategy-config.model';

export const EXPANDABLE_VIRTUAL_SCROLL_STRATEGY_CONFIG =
  new InjectionToken<ExpandableVirtualScrollStrategyConfig>(
    'EXPANDABLE_VIRTUAL_SCROLL_STRATEGY_CONFIG',
  );

/**
 * `VirtualScrollStrategy` for a list of equal-height rows where **at most one
 * row can be expanded** to a known taller height. Keeps `CdkVirtualScrollViewport`
 * scroll math correct without bringing in `cdk-experimental/scrolling` autosize.
 *
 * Total content height = `count * collapsedItemSize + (expanded ? delta : 0)`
 * where `delta = expandedItemSize - collapsedItemSize`.
 *
 * Configuration is injected through `EXPANDABLE_VIRTUAL_SCROLL_STRATEGY_CONFIG`
 * so each consumer (component) can provide its own row sizes and buffers
 * without leaking implementation knobs into the public surface.
 */
@Injectable()
export class ExpandableVirtualScrollStrategyService implements VirtualScrollStrategy {
  #config: ExpandableVirtualScrollStrategyConfig = inject(EXPANDABLE_VIRTUAL_SCROLL_STRATEGY_CONFIG);
  #dataLength: number = 0;
  #expandedIndex: number | null = null;
  #scrolledIndexChange = new Subject<number>();
  #viewport: CdkVirtualScrollViewport | null = null;

  scrolledIndexChange: Observable<number> = this.#scrolledIndexChange.pipe(distinctUntilChanged());

  attach(viewport: CdkVirtualScrollViewport): void {
    this.#viewport = viewport;
    this.#dataLength = viewport.getDataLength();
    this.#updateTotalContentSize();
    this.#updateRenderedRange();
  }

  detach(): void {
    this.#scrolledIndexChange.complete();
    this.#viewport = null;
  }

  onContentScrolled(): void {
    if (this.#viewport !== null) {
      this.#updateRenderedRange();
    }
  }

  onDataLengthChanged(): void {
    if (this.#viewport === null) {
      return;
    }
    this.#dataLength = this.#viewport.getDataLength();
    this.#updateTotalContentSize();
    this.#updateRenderedRange();
  }

  onContentRendered(): void {
    /* no-op: content rendering finished */
  }

  onRenderedOffsetChanged(): void {
    /* no-op: rendered offset already follows our math */
  }

  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    this.#viewport?.scrollToOffset(this.offsetForIndex(index), behavior);
  }

  setExpandedIndex(index: number | null): void {
    if (index === this.#expandedIndex) {
      return;
    }
    this.#expandedIndex = index;
    if (this.#viewport !== null) {
      this.#updateTotalContentSize();
      this.#updateRenderedRange();
    }
  }

  /** Total height of the virtual content; pure function of inputs. */
  totalContentSize(): number {
    const base: number = this.#dataLength * this.#config.collapsedItemSize;
    return this.#expandedIndex === null ? base : base + this.#expandSizeDelta();
  }

  /** Offset (px) from the top to the start of `index`. */
  offsetForIndex(index: number): number {
    const baseOffset: number = index * this.#config.collapsedItemSize;
    if (this.#expandedIndex === null || index <= this.#expandedIndex) {
      return baseOffset;
    }
    return baseOffset + this.#expandSizeDelta();
  }

  /** Index at the given pixel offset. */
  indexForOffset(offset: number): number {
    if (offset <= 0) {
      return 0;
    }
    if (this.#expandedIndex === null) {
      return Math.floor(offset / this.#config.collapsedItemSize);
    }
    const expandedStart: number = this.#expandedIndex * this.#config.collapsedItemSize;
    if (offset < expandedStart) {
      return Math.floor(offset / this.#config.collapsedItemSize);
    }
    const expandedEnd: number = expandedStart + this.#config.expandedItemSize;
    if (offset < expandedEnd) {
      return this.#expandedIndex;
    }
    return Math.floor((offset - this.#expandSizeDelta()) / this.#config.collapsedItemSize);
  }

  #expandSizeDelta(): number {
    return this.#config.expandedItemSize - this.#config.collapsedItemSize;
  }

  #updateTotalContentSize(): void {
    this.#viewport?.setTotalContentSize(this.totalContentSize());
  }

  #updateRenderedRange(): void {
    if (this.#viewport === null) {
      return;
    }
    const scrollOffset: number = this.#viewport.measureScrollOffset();
    const viewportSize: number = this.#viewport.getViewportSize();

    const firstVisibleIndex: number = this.indexForOffset(scrollOffset);
    const startBuffer: number = scrollOffset - this.offsetForIndex(firstVisibleIndex);
    const lastVisibleIndex: number = this.indexForOffset(scrollOffset + viewportSize) + 1;
    const endBuffer: number = this.offsetForIndex(lastVisibleIndex) - (scrollOffset + viewportSize);

    let renderedStart: number = firstVisibleIndex;
    let renderedEnd: number = lastVisibleIndex;
    if (startBuffer < this.#config.minBufferPx) {
      const expand: number = Math.ceil(
        (this.#config.maxBufferPx - startBuffer) / this.#config.collapsedItemSize,
      );
      renderedStart = Math.max(0, renderedStart - expand);
    }
    if (endBuffer < this.#config.minBufferPx) {
      const expand: number = Math.ceil(
        (this.#config.maxBufferPx - endBuffer) / this.#config.collapsedItemSize,
      );
      renderedEnd = Math.min(this.#dataLength, renderedEnd + expand);
    }

    this.#viewport.setRenderedRange({ start: renderedStart, end: renderedEnd });
    this.#viewport.setRenderedContentOffset(this.offsetForIndex(renderedStart));
    this.#scrolledIndexChange.next(firstVisibleIndex);
  }
}
