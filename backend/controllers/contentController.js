const db = require('../config/db');

exports.getAllLanguages = async (req, res) => {
    try {
        const [languages] = await db.query(`
            SELECT l.*, u_d.name as disabled_by_name 
            FROM languages l 
            LEFT JOIN users u_d ON l.disabled_by = u_d.id 
            ORDER BY l.created_at DESC
        `);
        res.json(languages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching languages' });
    }
};

exports.createLanguage = async (req, res) => {
    const { name, slug, description, difficulty_levels, is_active, has_practice, has_notes } = req.body;
    const createdBy = req.user.id;

    try {
        if (!name || !slug) return res.status(400).json({ message: 'Name and Slug are required' });

        const [existing] = await db.query('SELECT id FROM languages WHERE slug = ? OR name = ?', [slug, name]);
        if (existing.length > 0) return res.status(400).json({ message: 'Language name or slug already exists' });

        await db.query(
            'INSERT INTO languages (name, slug, description, difficulty_levels, is_active, has_practice, has_notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                name,
                slug,
                description || '',
                JSON.stringify(difficulty_levels || ["Easy", "Medium", "Hard"]),
                is_active ? 1 : 0,
                has_practice ? 1 : 0,
                has_notes ? 1 : 0,
                createdBy
            ]
        );

        res.status(201).json({ message: 'Language created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error creating language' });
    }
};

exports.updateLanguage = async (req, res) => {
    const { id } = req.params;
    const { name, description, difficulty_levels, has_practice, has_notes } = req.body;

    try {
        await db.query(
            'UPDATE languages SET name = ?, description = ?, difficulty_levels = ?, has_practice = ?, has_notes = ? WHERE id = ?',
            [name, description, JSON.stringify(difficulty_levels), has_practice ? 1 : 0, has_notes ? 1 : 0, id]
        );
        res.json({ message: 'Language updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating language' });
    }
};

exports.toggleLanguageStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;

    try {
        await db.query('UPDATE languages SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
        res.json({ message: `Language ${is_active ? 'enabled' : 'disabled'} successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error toggling status' });
    }
};

// --- TOPICS ---

exports.getTopicsByLanguage = async (req, res) => {
    const { languageId } = req.params;
    try {
        const [topics] = await db.query('SELECT * FROM topics WHERE language_id = ? ORDER BY order_index ASC', [languageId]);
        res.json(topics);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching topics' });
    }
};

exports.createTopic = async (req, res) => {
    const { language_id, name, slug, order_index, is_active } = req.body;
    const createdBy = req.user.id;

    try {
        if (!name || !slug) return res.status(400).json({ message: 'Name and Slug are required' });

        const [existing] = await db.query('SELECT id FROM topics WHERE slug = ?', [slug]);
        if (existing.length > 0) return res.status(400).json({ message: 'Topic slug must be unique' });

        await db.query(
            'INSERT INTO topics (language_id, name, slug, order_index, is_active, created_by) VALUES (?, ?, ?, ?, ?, ?)',
            [language_id, name, slug, order_index || 0, is_active ? 1 : 0, createdBy]
        );
        res.status(201).json({ message: 'Topic created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error creating topic' });
    }
};

exports.updateTopic = async (req, res) => {
    const { id } = req.params;
    const { name, order_index } = req.body;

    try {
        await db.query(
            'UPDATE topics SET name = ?, order_index = ? WHERE id = ?',
            [name, order_index, id]
        );
        res.json({ message: 'Topic updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating topic' });
    }
};

exports.toggleTopicStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    try {
        await db.query('UPDATE topics SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
        res.json({ message: 'Topic status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating status' });
    }
};

// --- SUBTOPICS ---

exports.getSubtopicsByTopic = async (req, res) => {
    const { topicId } = req.params;
    try {
        const [subtopics] = await db.query('SELECT * FROM subtopics WHERE topic_id = ? ORDER BY order_index ASC', [topicId]);
        res.json(subtopics);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching subtopics' });
    }
};

exports.createSubtopic = async (req, res) => {
    const { topic_id, name, slug, order_index, is_active } = req.body;
    const createdBy = req.user.id;

    try {
        const [existing] = await db.query('SELECT id FROM subtopics WHERE slug = ?', [slug]);
        if (existing.length > 0) return res.status(400).json({ message: 'Subtopic slug must be unique' });

        await db.query(
            'INSERT INTO subtopics (topic_id, name, slug, order_index, is_active, created_by) VALUES (?, ?, ?, ?, ?, ?)',
            [topic_id, name, slug, order_index || 0, is_active ? 1 : 0, createdBy]
        );
        res.status(201).json({ message: 'Subtopic created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error creating subtopic' });
    }
};

exports.updateSubtopic = async (req, res) => {
    const { id } = req.params;
    const { name, order_index } = req.body;

    try {
        await db.query(
            'UPDATE subtopics SET name = ?, order_index = ? WHERE id = ?',
            [name, order_index, id]
        );
        res.json({ message: 'Subtopic updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating subtopic' });
    }
};

exports.toggleSubtopicStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    try {
        await db.query('UPDATE subtopics SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
        res.json({ message: 'Subtopic status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating status' });
    }
};
