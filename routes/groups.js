const express = require('express');
const router = express.Router();
const store = require('../store');

/**
 * GET /groups
 * List all groups
 */
router.get('/', (req, res) => {
  const groups = store.getAllGroups();
  res.json({ groups });
});

/**
 * POST /groups/create
 * Create a new group
 */
router.post('/create', (req, res) => {
  try {
    const { groupId, name, description, icon, agentId } = req.body;
    
    if (!groupId || !name || !agentId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['groupId', 'name', 'agentId'],
        optional: ['description', 'icon']
      });
    }
    
    if (!store.agentExists(agentId)) {
      return res.status(404).json({ error: `Agent '${agentId}' not registered` });
    }
    
    const group = store.createGroup({
      groupId,
      name,
      description,
      icon,
      createdBy: agentId
    });
    
    res.status(201).json({
      message: 'Group created successfully',
      group: {
        groupId: group.groupId,
        name: group.name,
        description: group.description,
        icon: group.icon,
        createdBy: group.createdBy,
        memberCount: group.members.length
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /groups/:groupId
 * Get group info
 */
router.get('/:groupId', (req, res) => {
  const group = store.getGroup(req.params.groupId);
  
  if (!group) {
    return res.status(404).json({ error: `Group '${req.params.groupId}' not found` });
  }
  
  res.json({
    groupId: group.groupId,
    name: group.name,
    description: group.description,
    icon: group.icon,
    createdBy: group.createdBy,
    createdAt: group.createdAt,
    memberCount: group.members.length,
    messageCount: group.messages.length
  });
});

/**
 * POST /groups/:groupId/join
 * Join a group
 */
router.post('/:groupId/join', (req, res) => {
  try {
    const { agentId } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: 'Missing required field: agentId' });
    }
    
    const group = store.joinGroup(req.params.groupId, agentId);
    
    res.json({
      message: `Joined group '${group.name}'`,
      groupId: group.groupId,
      memberCount: group.members.length
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /groups/:groupId/members
 * Get group members
 */
router.get('/:groupId/members', (req, res) => {
  const group = store.getGroup(req.params.groupId);
  
  if (!group) {
    return res.status(404).json({ error: `Group '${req.params.groupId}' not found` });
  }
  
  const members = store.getGroupMembers(req.params.groupId);
  
  res.json({
    groupId: group.groupId,
    memberCount: members.length,
    members: members.map(m => ({
      agentId: m.agentId,
      name: m.name
    }))
  });
});

/**
 * GET /groups/:groupId/messages
 * Get messages in a group
 */
router.get('/:groupId/messages', (req, res) => {
  const group = store.getGroup(req.params.groupId);
  
  if (!group) {
    return res.status(404).json({ error: `Group '${req.params.groupId}' not found` });
  }
  
  const limit = parseInt(req.query.limit) || 50;
  const since = parseInt(req.query.since) || 0;
  
  const { messages, total } = store.getMessages(req.params.groupId, { limit, since });
  
  res.json({
    groupId: req.params.groupId,
    count: messages.length,
    total,
    messages
  });
});

/**
 * POST /groups/:groupId/message
 * Post a message to a group
 */
router.post('/:groupId/message', (req, res) => {
  try {
    const { agentId, content, replyTo } = req.body;
    
    if (!agentId || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['agentId', 'content'],
        optional: ['replyTo']
      });
    }
    
    const message = store.postMessage(req.params.groupId, agentId, content, replyTo);
    
    res.status(201).json({
      message: 'Message posted',
      data: message
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
