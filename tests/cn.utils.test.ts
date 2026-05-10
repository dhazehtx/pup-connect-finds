import { describe, expect, it } from 'vitest';
import { cn } from '../client/src/lib/utils';

describe('cn utility', () => {
  it('merges classes and resolves tailwind conflicts', () => {
    const result = cn('p-2 text-sm', false && 'hidden', 'p-4', 'text-sm');
    expect(result).toBe('p-4 text-sm');
  });
});
