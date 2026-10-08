import { describe, it, expect } from 'vitest';
import { parseCsv } from '../../../processes/shared/parseCsv.js';

describe('parseCsv', async () => {
  it('should parse a simple CSV string', async () => {
    const csv = 'Name,Age,City\nJohn,30,New York\nJane,25,Los Angeles';
    const result = await parseCsv(csv);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ Name: 'John', Age: '30', City: 'New York' });
    expect(result[1]).toEqual({ Name: 'Jane', Age: '25', City: 'Los Angeles' });
  });

  it('should return empty array for empty input', async () => {
    const result = await parseCsv('');
    expect(result).toEqual([]);
  });

  it('should return empty array for header-only input', async () => {
    const csv = 'Name,Age,City';
    const result = await parseCsv(csv);
    expect(result).toEqual([]);
  });

  it('should handle quoted fields with commas', async () => {
    const csv = 'Name,Description\nJohn,"Hello, World"';
    const result = await parseCsv(csv);

    expect(result).toHaveLength(1);
    expect(result[0].Description).toBe('Hello, World');
  });

  it('should handle escaped quotes inside quoted fields', async () => {
    const csv = 'Name,Quote\nJohn,"He said ""Hello"""';
    const result = await parseCsv(csv);

    expect(result).toHaveLength(1);
    expect(result[0].Quote).toBe('He said "Hello"');
  });

  it('should handle CRLF line endings', async () => {
    const csv = 'Name,Age\r\nJohn,30\r\nJane,25';
    const result = await parseCsv(csv);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ Name: 'John', Age: '30' });
  });

  it('should handle LF line endings', async () => {
    const csv = 'Name,Age\nJohn,30\nJane,25';
    const result = await parseCsv(csv);

    expect(result).toHaveLength(2);
  });

  it('should skip empty lines', async () => {
    const csv = 'Name,Age\nJohn,30\n\nJane,25';
    const result = await parseCsv(csv);

    expect(result).toHaveLength(2);
  });

  it('should handle newlines within quoted fields', async () => {
    const csv = 'Name,Address\nJohn,"123 Main St\nApt 4"';
    const result = await parseCsv(csv);

    expect(result).toHaveLength(1);
    expect(result[0].Address).toBe('123 Main St\nApt 4');
  });

  it('should trim whitespace from values', async () => {
    const csv = 'Name,Age\n  John  ,  30  ';
    const result = await parseCsv(csv);

    expect(result[0].Name).toBe('John');
    expect(result[0].Age).toBe('30');
  });

  it('should handle missing values (fewer columns than headers)', async () => {
    const csv = 'Name,Age,City\nJohn,30';
    const result = await parseCsv(csv);

    expect(result[0].Name).toBe('John');
    expect(result[0].Age).toBe('30');
    expect(result[0].City).toBe('');
  });

  it('should apply field mapping when provided', async () => {
    const csv = 'Full Name,Years Old\nJohn,30';
    const fieldMap = {
      'Full Name': 'name',
      'Years Old': 'age',
    };
    const result = await parseCsv(csv, fieldMap);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ name: 'John', age: '30' });
  });

  it('should fallback to snake_case for unmapped headers', async () => {
    const csv = 'Full Name,Age\nJohn,30';
    const fieldMap = {
      'Full Name': 'name',
      // 'Age' is not mapped
    };
    const result = await parseCsv(csv, fieldMap);

    expect(result[0]).toHaveProperty('name', 'John');
    expect(result[0]).toHaveProperty('age', '30');
  });
});
