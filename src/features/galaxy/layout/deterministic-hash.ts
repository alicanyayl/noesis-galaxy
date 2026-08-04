export function stableHash(value: string) {
  let hash = 2_166_136_261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }

  return hash >>> 0
}

export function deterministicUnit(value: string, salt: string) {
  return stableHash(`${salt}:${value}`) / 0xffffffff
}

export function deterministicSigned(value: string, salt: string) {
  return deterministicUnit(value, salt) * 2 - 1
}
