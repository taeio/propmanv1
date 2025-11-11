export function assignPriorityFromMessage(title: string, description: string): "low" | "medium" | "high" | "urgent" {
  const combinedText = `${title} ${description}`.toLowerCase();

  const urgentKeywords = [
    'emergency', 'urgent', 'immediately', 'asap', 'dangerous', 'hazard',
    'flooding', 'flood', 'fire', 'gas leak', 'gas', 'electrical shock',
    'no water', 'no heat', 'no power', 'broken window', 'security',
    'carbon monoxide', 'smoke', 'burst pipe', 'sewage', 'major leak'
  ];

  const highKeywords = [
    'leak', 'leaking', 'broken', 'not working', 'stopped working',
    'water damage', 'mold', 'pest', 'rodent', 'heating', 'cooling',
    'ac not working', 'heater broken', 'toilet', 'hot water',
    'refrigerator', 'stove', 'oven', 'lock', 'door broken'
  ];

  const mediumKeywords = [
    'repair', 'fix', 'issue', 'problem', 'needs attention',
    'dripping', 'slow drain', 'noisy', 'squeaking', 'cracked',
    'loose', 'sticking', 'paint', 'cabinet', 'drawer', 'light'
  ];

  for (const keyword of urgentKeywords) {
    if (combinedText.includes(keyword)) {
      return 'urgent';
    }
  }

  for (const keyword of highKeywords) {
    if (combinedText.includes(keyword)) {
      return 'high';
    }
  }

  for (const keyword of mediumKeywords) {
    if (combinedText.includes(keyword)) {
      return 'medium';
    }
  }

  return 'low';
}
