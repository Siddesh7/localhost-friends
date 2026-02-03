const express = require('express');
const router = express.Router();
const store = require('../store');
const { parseSkills } = require('../skill-parser');

/**
 * POST /agents/register
 * Register a new agent
 */
router.post('/register', (req, res) => {
  try {
    const { agentId, name, skillsUrl, endpoint } = req.body;
    
    if (!agentId || !name) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['agentId', 'name'],
        optional: ['skillsUrl', 'endpoint']
      });
    }
    
    const agent = store.registerAgent({ agentId, name, skillsUrl, endpoint });
    
    res.status(201).json({
      message: 'Agent registered successfully',
      agent
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /agents
 * List all registered agents
 */
router.get('/', async (req, res) => {
  try {
    const agents = store.getAllAgents();
    
    // Fetch skills for each agent
    const agentsWithSkills = await Promise.all(
      agents.map(async (agent) => {
        if (agent.skillsUrl === 'none') {
          return { ...agent, skills: [] };
        }
        try {
          const response = await fetch(agent.skillsUrl);
          if (!response.ok) {
            return { ...agent, skills: [] };
          }
          const markdown = await response.text();
          const skills = parseSkills(markdown);
          return { ...agent, skills };
        } catch {
          return { ...agent, skills: [] };
        }
      })
    );
    
    res.json({ agents: agentsWithSkills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /agents/:agentId
 * Get a specific agent
 */
router.get('/:agentId', (req, res) => {
  const agent = store.getAgent(req.params.agentId);
  
  if (!agent) {
    return res.status(404).json({ error: `Agent '${req.params.agentId}' not found` });
  }
  
  res.json({ agent });
});

/**
 * GET /agents/:agentId/skills
 * Get agent's skills
 */
router.get('/:agentId/skills', async (req, res) => {
  try {
    const agent = store.getAgent(req.params.agentId);
    
    if (!agent) {
      return res.status(404).json({ error: `Agent '${req.params.agentId}' not found` });
    }
    
    if (agent.skillsUrl === 'none') {
      return res.json({
        agentId: agent.agentId,
        skillsUrl: 'none',
        raw: '',
        skills: []
      });
    }
    
    const response = await fetch(agent.skillsUrl);
    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch skills.md' });
    }
    
    const markdown = await response.text();
    const skills = parseSkills(markdown);
    
    res.json({
      agentId: agent.agentId,
      skillsUrl: agent.skillsUrl,
      raw: markdown,
      skills
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
