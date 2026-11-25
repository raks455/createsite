export const clone = <T>(o: T): T => (o === undefined ? o : JSON.parse(JSON.stringify(o)));
