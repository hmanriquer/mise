export type EnumValue<T extends Record<string, string>> = T[keyof T]

export function enumValues<T extends Record<string, string>>(enumObject: T): EnumValue<T>[] {
  return Object.values(enumObject) as EnumValue<T>[]
}
