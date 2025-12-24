function replaceSubString(
  str: string,
  start: number,
  length: number,
  marker: string = "#"
): string {
  return (
    str.slice(0, start) + marker.repeat(length) + str.slice(start + length)
  );
}
export default replaceSubString;
