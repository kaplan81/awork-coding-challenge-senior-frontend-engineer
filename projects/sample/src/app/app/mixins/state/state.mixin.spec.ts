import { Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Constructor } from '../../models/constructor.model';
import { State } from '../../models/state.model';
import { emptyBase } from '../empty';
import { StateMixin } from './state.mixin';

const initialState = {
  value: 0,
  text: 'initial',
};

describe('StateMixin', () => {
  let instance: State<typeof initialState>;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      const mixinClass: Constructor<State<typeof initialState>> & Constructor = StateMixin<
        Constructor,
        typeof initialState
      >(emptyBase, initialState);
      instance = new mixinClass();
    });
  });

  describe('constructor()', () => {
    it('should initialize with the initial state', () => {
      expect(instance.state()).toEqual(initialState);
    });
  });

  describe('getStateProp()', () => {
    it('should get a specific property from state with getStateProp', () => {
      const valueSignal: Signal<number> = instance.getStateProp('value');
      const textSignal: Signal<string> = instance.getStateProp('text');
      expect(valueSignal()).toBe(0);
      expect(textSignal()).toBe('initial');
    });
  });

  describe('resetState()', () => {
    it('should reset state to initial state when defaultState is null', () => {
      instance.updateState({
        value: 99,
        text: 'changed',
      });
      instance.resetState();
      expect(instance.state()).toEqual(initialState);
    });

    it('should reset state to defaultState when available', () => {
      const defaultState: typeof initialState = {
        value: 50,
        text: 'default',
      };
      instance.defaultState.set(defaultState);
      instance.updateState({
        value: 99,
        text: 'changed',
      });
      instance.resetState();
      expect(instance.state()).toEqual(defaultState);
    });

    it('should execute provided callback when resetting state', () => {
      const callback = vi.fn();
      instance.updateState({
        value: 99,
        text: 'changed',
      });
      instance.resetState(callback);
      expect(callback).toHaveBeenCalledWith(instance.state());
    });
  });

  describe('updateState()', () => {
    it('should update the entire state with updateState', () => {
      const newState: typeof initialState = {
        value: 42,
        text: 'updated',
      };
      instance.updateState(newState);
      expect(instance.state()).toEqual(newState);
    });

    it('should execute provided callback when updating state', () => {
      const callback = vi.fn();
      instance.updateState({ value: 123, text: 'callback test' }, callback);
      expect(callback).toHaveBeenCalledWith(instance.state());
    });
  });

  describe('updateStateProp()', () => {
    it('should update a specific property with updateStateProp', () => {
      instance.updateStateProp('value', 100);
      expect(instance.state().value).toBe(100);
      expect(instance.state().text).toBe('initial');
    });

    it('should execute provided callback when updating state property', () => {
      const callback = vi.fn();
      instance.updateStateProp('value', 77, callback);
      expect(callback).toHaveBeenCalledWith(instance.state());
      expect(instance.state().value).toBe(77);
    });
  });
});
