export function replaceSpacesAndHyphens(input: string): string {
  return input.replace(/[\s\-+]/g, '');
}
