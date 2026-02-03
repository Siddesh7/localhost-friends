/**
 * Simple markdown parser for skills.md files
 * Extracts skill names from headers like: ## Skill: skill_name
 */

/**
 * Parse skills from markdown content
 * @param {string} markdown - Raw markdown content
 * @returns {string[]} - Array of skill names
 */
function parseSkills(markdown) {
  const skills = [];
  const lines = markdown.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Match pattern: ## Skill: skill_name
    const match = trimmed.match(/^##\s*Skill:\s*(.+)$/i);
    if (match) {
      skills.push(match[1].trim());
    }
  }
  
  return skills;
}

module.exports = { parseSkills };
