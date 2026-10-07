export function validateSchema(instance, schema) {
  const errors = [];

  function resolveRef(ref) {
    if (!ref.startsWith('#/')) throw new Error(`unsupported $ref: ${ref}`);
    return ref.slice(2).split('/').reduce((value, key) => value[key], schema);
  }

  function same(a,b) { return JSON.stringify(a) === JSON.stringify(b); }

  function visit(value, rule, at) {
    if (rule.$ref) return visit(value, resolveRef(rule.$ref), at);
    if ('const' in rule && !same(value, rule.const)) errors.push(`${at}: const mismatch`);
    if (rule.enum && !rule.enum.some(candidate => same(value, candidate))) errors.push(`${at}: not in enum`);

    const types = rule.type ? (Array.isArray(rule.type) ? rule.type : [rule.type]) : [];
    if (types.length) {
      const actual = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
      if (!types.includes(actual)) { errors.push(`${at}: expected ${types.join('|')}, got ${actual}`); return; }
    }

    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) errors.push(`${at}: too short`);
      if (rule.pattern && !(new RegExp(rule.pattern).test(value))) errors.push(`${at}: pattern mismatch`);
    }

    if (Array.isArray(value)) {
      if (rule.minItems && value.length < rule.minItems) errors.push(`${at}: too few items`);
      if (rule.uniqueItems) {
        const serial = value.map(item => JSON.stringify(item));
        if (new Set(serial).size !== serial.length) errors.push(`${at}: duplicate array items`);
      }
      if (rule.items) value.forEach((item,index) => visit(item, rule.items, `${at}[${index}]`));
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const props = rule.properties ?? {};
      for (const req of rule.required ?? []) if (!(req in value)) errors.push(`${at}: missing ${req}`);
      if (rule.additionalProperties === false) {
        for (const key of Object.keys(value)) if (!(key in props)) errors.push(`${at}: unexpected ${key}`);
      }
      for (const [key, child] of Object.entries(props)) if (key in value) visit(value[key], child, `${at}.${key}`);
    }
  }

  visit(instance, schema, '$');
  return errors;
}
