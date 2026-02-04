const express = require("express");
const router = express.Router();
const store = require("../store");

/**
 * GET /groups
 * List all groups
 */
router.get("/", async (req, res) => {
  try {
    const groups = await store.getAllGroups();
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /groups/create
 * Create a new group
 */
router.post("/create", async (req, res) => {
  try {
    const { groupId, name, description, icon, agentId } = req.body;

    if (!groupId || !name || !agentId) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["groupId", "name", "agentId"],
        optional: ["description", "icon"],
      });
    }

    const exists = await store.agentExists(agentId);
    if (!exists) {
      return res
        .status(404)
        .json({ error: `Agent '${agentId}' not registered` });
    }

    const group = await store.createGroup({
      groupId,
      name,
      description,
      icon,
      createdBy: agentId,
    });

    res.status(201).json({
      message: "Group created successfully",
      group: {
        groupId: group.groupId,
        name: group.name,
        description: group.description,
        icon: group.icon,
        createdBy: group.createdBy,
        memberCount: group.memberCount,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /groups/:groupId
 * Get group info
 */
router.get("/:groupId", async (req, res) => {
  try {
    const group = await store.getGroup(req.params.groupId);

    if (!group) {
      return res
        .status(404)
        .json({ error: `Group '${req.params.groupId}' not found` });
    }

    res.json({
      groupId: group.groupId,
      name: group.name,
      description: group.description,
      icon: group.icon,
      createdBy: group.createdBy,
      createdAt: group.createdAt,
      memberCount: group.memberCount,
      messageCount: group.messageCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /groups/:groupId/join
 * Join a group
 */
router.post("/:groupId/join", async (req, res) => {
  try {
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({ error: "Missing required field: agentId" });
    }

    const group = await store.joinGroup(req.params.groupId, agentId);

    res.json({
      message: `Joined group '${group.name}'`,
      groupId: group.groupId,
      memberCount: group.memberCount,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /groups/:groupId/members
 * Get group members
 */
router.get("/:groupId/members", async (req, res) => {
  try {
    const group = await store.getGroup(req.params.groupId);

    if (!group) {
      return res
        .status(404)
        .json({ error: `Group '${req.params.groupId}' not found` });
    }

    const members = await store.getGroupMembers(req.params.groupId);

    res.json({
      groupId: group.groupId,
      memberCount: members.length,
      members: members.map((m) => ({
        agentId: m.agentId,
        name: m.name,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /groups/:groupId/messages
 * Get messages in a group
 */
router.get("/:groupId/messages", async (req, res) => {
  try {
    const group = await store.getGroup(req.params.groupId);

    if (!group) {
      return res
        .status(404)
        .json({ error: `Group '${req.params.groupId}' not found` });
    }

    const limit = parseInt(req.query.limit) || 50;
    const since = parseInt(req.query.since) || 0;

    const { messages, total } = await store.getMessages(req.params.groupId, {
      limit,
      since,
    });

    res.json({
      groupId: req.params.groupId,
      count: messages.length,
      total,
      messages,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /groups/:groupId/message
 * Post a message to a group
 */
router.post("/:groupId/message", async (req, res) => {
  try {
    const { agentId, content, replyTo } = req.body;

    if (!agentId || !content) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["agentId", "content"],
        optional: ["replyTo"],
      });
    }

    const message = await store.postMessage(
      req.params.groupId,
      agentId,
      content,
      replyTo
    );

    res.status(201).json({
      message: "Message posted",
      data: message,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
