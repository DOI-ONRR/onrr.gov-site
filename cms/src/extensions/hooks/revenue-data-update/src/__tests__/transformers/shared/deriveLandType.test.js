import { describe, it, expect } from 'vitest';
import { deriveLandType } from '../../../transformers/shared/deriveLandType.js';

describe('deriveLandType', () => {
  it('maps Federal onshore/offshore', () => {
    expect(deriveLandType('Federal', 'Onshore')).toBe('Federal onshore');
    expect(deriveLandType('Federal', 'Offshore')).toBe('Federal offshore');
  });

  it('maps Mixed Exploratory like Federal', () => {
    expect(deriveLandType('Mixed Exploratory', 'Onshore')).toBe('Federal onshore');
    expect(deriveLandType('Mixed Exploratory', 'Offshore')).toBe('Federal offshore');
  });

  it('maps Native American regardless of category', () => {
    expect(deriveLandType('Native American', 'Onshore')).toBe('Native American');
    expect(deriveLandType('Native American', '')).toBe('Native American');
  });

  it('maps Federal "Not Tied to a Lease"', () => {
    expect(deriveLandType('Federal', 'Not Tied to a Lease')).toBe('Federal - not tied to a lease');
  });

  it('returns empty string when no rule matches', () => {
    expect(deriveLandType('', '')).toBe('');
    expect(deriveLandType('Federal', '')).toBe('');
    expect(deriveLandType('Something else', 'Onshore')).toBe('');
  });
});
