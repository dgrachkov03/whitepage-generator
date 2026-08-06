export function legalSectionSlug(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function groupLegalSectionsByH2(sections) {
  if (!Array.isArray(sections)) {
    return [];
  }

  const groups = [];
  let current = { heading: null, sections: [] };

  sections.forEach((section) => {
    if (section.type === "heading" && section.level === 2) {
      if (current.heading || current.sections.length) {
        groups.push(current);
      }

      current = { heading: section, sections: [] };
      return;
    }

    current.sections.push(section);
  });

  if (current.heading || current.sections.length) {
    groups.push(current);
  }

  return groups;
}
