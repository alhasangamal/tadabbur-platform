const RELATION_TYPE_AR = {
  RELATES: 'يتعلق بـ',
  RELATED_TO: 'مرتبط بـ',
  FATHER_OF: 'أب لـ',
  SON_OF: 'ابن',
  WIFE_OF: 'زوجة',
  HUSBAND_OF: 'زوج',
  BROTHER_OF: 'أخ',
  SISTER_OF: 'أخت',
  SENT_TO: 'أُرسل إلى',
  BELONGS_TO: 'ينتمي إلى',
  PART_OF: 'جزء من',
  LOCATED_IN: 'يقع في',
  MENTIONED_WITH: 'ذُكر مع',
};


export function normalizeRelationType(value) {
  if (!value) return 'RELATES';

  return String(value)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')
    .replace(/REALTED/g, 'RELATED')
    .replace(/^RELATED$/, 'RELATED_TO');
}

export function getRelationLabel(relation, lang = 'ar') {
  const rawLabel = (
    relation?.relation_label_ar ||
    relation?.label_ar ||
    relation?.label ||
    ''
  ).trim();

  if (rawLabel) return rawLabel;

  const type = normalizeRelationType(relation?.relation_type || relation?.type);
  const labels = RELATION_TYPE_AR;

  return labels[type] || 'علاقة';
}
