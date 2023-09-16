interface JSON {
  /**
   * By default, JSON returns `any` from `parse`. This was a thing in ES5 but is no
   * longer necessary with `unknown` now a feature of Typescript. Instead of having to
   * turn off ESLint rules around `any`, this definition allows us to instead type
   * `JSON.parse` a little more cleanly with a generic parameter. Note: this may
   * result in a runtime error if `JSON.parse` returns an unknown object type instead
   * of the `DataType` you expect. ALWAYS surround this in a try/catch!
   */
  parse<DataType>(
    text: string,
    reviver?: (this: unknown, key: string, value: unknown) => unknown,
  ): DataType;
}
