export function placeholder(width, height) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#e5e5e5"/>
      <g transform="translate(${width / 2 - 20}, ${height / 2 - 15})" fill="none" stroke="#a3a3a3" stroke-width="2">
        <rect x="0" y="0" width="40" height="30" rx="2"/>
        <circle cx="10" cy="9" r="3"/>
        <path d="M0 24 L12 14 L20 20 L28 12 L40 22" />
      </g>
    </svg>
  `.trim();

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
