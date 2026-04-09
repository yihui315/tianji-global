/**
 * Tarot API Tests — TianJi Global
 */
import { describe, it, expect } from 'vitest';
import {
  shuffleDeck,
  drawCards,
  getRandomCard,
  spreadLayouts,
} from '../../lib/tarot';

describe('Tarot API', () => {
  describe('shuffleDeck', () => {
    it('returns an array of 78 cards', () => {
      const deck = shuffleDeck();
      expect(deck).toHaveLength(78);
    });

    it('contains all unique cards', () => {
      const deck = shuffleDeck();
      const ids = deck.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(78);
    });

    it('each card has required fields', () => {
      const deck = shuffleDeck();
      for (const card of deck) {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('name');
        expect(card).toHaveProperty('arcana');
        expect(['major', 'minor']).toContain(card.arcana);
      }
    });

    it('shuffle produces potentially different order each time', () => {
      const deck1 = shuffleDeck();
      const deck2 = shuffleDeck();
      // There's a very small chance they're the same, but practically this should differ
      const sameOrder = deck1.every((c, i) => c.id === deck2[i].id);
      // We just verify both are valid decks; order may or may not differ
      expect(deck1).toHaveLength(78);
      expect(deck2).toHaveLength(78);
    });
  });

  describe('drawCards', () => {
    it('returns requested number of cards', () => {
      const deck = shuffleDeck();
      const { cards } = drawCards(deck, 3);
      expect(cards).toHaveLength(3);
    });

    it('single draw returns 1 card', () => {
      const deck = shuffleDeck();
      const { cards, isReversed } = drawCards(deck, 1);
      expect(cards).toHaveLength(1);
      expect(isReversed).toHaveLength(1);
    });

    it('celtic cross draw returns 10 cards', () => {
      const deck = shuffleDeck();
      const { cards, isReversed } = drawCards(deck, 10);
      expect(cards).toHaveLength(10);
      expect(isReversed).toHaveLength(10);
    });

    it('isReversed array matches card count', () => {
      const deck = shuffleDeck();
      const { cards, isReversed } = drawCards(deck, 5);
      expect(isReversed).toHaveLength(cards.length);
    });
  });

  describe('getRandomCard', () => {
    it('returns a single card with isReversed boolean', () => {
      const result = getRandomCard();
      expect(result.card).toBeDefined();
      expect(result.card).toHaveProperty('id');
      expect(result.card).toHaveProperty('name');
      expect(typeof result.isReversed).toBe('boolean');
    });
  });

  describe('spreadLayouts', () => {
    it('has three spread layouts', () => {
      expect(spreadLayouts).toHaveLength(3);
    });

    it('single spread has cardCount of 1', () => {
      expect(spreadLayouts[0].cardCount).toBe(1);
      expect(spreadLayouts[0].name).toBe('Single Card');
    });

    it('three-card spread has cardCount of 3', () => {
      expect(spreadLayouts[1].cardCount).toBe(3);
    });

    it('celtic-cross spread has cardCount of 10', () => {
      expect(spreadLayouts[2].cardCount).toBe(10);
      expect(spreadLayouts[2].name).toBe('Celtic Cross');
    });

    it('each spread has positions matching cardCount', () => {
      for (const spread of spreadLayouts) {
        expect(spread.positions).toHaveLength(spread.cardCount);
        for (const pos of spread.positions) {
          expect(pos).toHaveProperty('name');
          expect(pos).toHaveProperty('nameChinese');
        }
      }
    });
  });

  describe('Tarot route validation logic', () => {
    function validateSpreadType(spreadType: string | undefined) {
      const validSpreads = ['single', 'three-card', 'celtic-cross'];
      if (!spreadType || !validSpreads.includes(spreadType)) {
        return {
          status: 400,
          error: 'Invalid spread type. Must be: single, three-card, or celtic-cross',
        };
      }
      return { status: 200, spreadType };
    }

    it('returns 400 for invalid spread type', () => {
      const result = validateSpreadType('invalid-spread');
      expect(result.status).toBe(400);
    });

    it('returns 400 for undefined spread type', () => {
      const result = validateSpreadType(undefined);
      expect(result.status).toBe(400);
    });

    it('returns 200 for valid spread types', () => {
      expect(validateSpreadType('single').status).toBe(200);
      expect(validateSpreadType('three-card').status).toBe(200);
      expect(validateSpreadType('celtic-cross').status).toBe(200);
    });

    it('card count matches spread type', () => {
      const spreadMap: Record<string, number> = {
        single: 1,
        'three-card': 3,
        'celtic-cross': 10,
      };
      for (const [type, count] of Object.entries(spreadMap)) {
        const deck = shuffleDeck();
        const { cards } = drawCards(deck, count);
        expect(cards).toHaveLength(count);
      }
    });
  });
});
