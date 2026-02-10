const db = require('../config/db');

exports.getAllLanguages = async (req, res) => {
    try {
        const [languages] = await db.query('SELECT id, name, slug, description, has_practice, has_notes FROM languages WHERE is_active = TRUE');
        res.status(200).json(languages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTopicsByLanguage = async (req, res) => {
    try {
        const { slug } = req.params;

        // First verify language exists
        const [lang] = await db.query('SELECT id, name FROM languages WHERE slug = ? AND is_active = TRUE', [slug]);

        if (lang.length === 0) {
            return res.status(404).json({ message: 'Language not found' });
        }

        const languageId = lang[0].id;
        const languageName = lang[0].name;

        // Fetch topics
        const [topics] = await db.query(
            'SELECT id, name, slug, order_index FROM topics WHERE language_id = ? AND is_active = TRUE ORDER BY order_index ASC',
            [languageId]
        );

        res.status(200).json({
            language: languageName,
            topics: topics
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
