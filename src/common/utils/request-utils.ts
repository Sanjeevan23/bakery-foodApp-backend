// src/common/utils/request.utils.ts
import { ValidationError } from 'class-validator';

/**
 * Flatten class-validator ValidationError objects to readable messages array.
 */
export function flattenValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  const walk = (errs: ValidationError[], prefix = '') => {
    for (const e of errs) {
      const propertyPath = prefix ? `${prefix}.${e.property}` : e.property;
      if (e.constraints) {
        for (const key of Object.keys(e.constraints)) {
          messages.push(`${propertyPath}: ${e.constraints[key]}`);
        }
      }
      if (e.children && e.children.length) {
        walk(e.children, propertyPath);
      }
    }
  };

  walk(errors);
  return messages;
}

/**
 * Parse a field that should be an array (ingredients).
 * Accepts:
 * - an already parsed array
 * - a JSON string array -> parsed
 * - a comma-separated string -> split to array
 * Returns: array (possibly empty)
 */
export function parseArrayField(raw: any): string[] {
  if (!raw && raw !== 0) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    // try JSON.parse
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // not JSON — continue below
    }
    // fallback: comma separated
    return trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  // if something else (object), try to coerce
  return [];
}

/**
 * Parse a field that must be a JSON array of objects (sizes).
 * Accepts:
 * - already parsed array
 * - JSON string -> parsed to array (throws if not array)
 * Throws Error if not an array.
 */
export function parseJsonArrayField(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      throw new Error('Value is not an array');
    } catch (err) {
      throw new Error('Value must be a valid JSON array');
    }
  }
  throw new Error('Value must be a JSON array');
}
