// Field descriptors. The admin panel generates every form from these.
//
// Types: text, textarea, richtext, code, number, toggle, select, color,
//        image, url, font, page, lines, list (with nested `fields`)
export interface FieldDef {
  key: string;
  label: string;
  type: string;
  default?: any;
  fields?: FieldDef[];
  item?: Record<string, any>;
  [extra: string]: any;
}

const f = (key: string, label: string, type = 'text', extra: Record<string, any> = {}): FieldDef => ({ key, label, type, ...extra });
const list = (key: string, label: string, fields: FieldDef[], item: Record<string, any> = {}, extra: Record<string, any> = {}): FieldDef =>
  ({ key, label, type: 'list', fields, item, ...extra });
const emptyValue = (fd: FieldDef): any => (fd.type === 'list' || fd.type === 'lines' ? [] : fd.type === 'toggle' ? false : '');

export { f, list, emptyValue };
