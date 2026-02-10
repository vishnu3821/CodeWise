const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// --- Helper: Delete File ---
const deleteFile = (filePath) => {
    if (!filePath) return;
    const fullPath = path.join(__dirname, '..', filePath);
    fs.unlink(fullPath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error deleting file:', err);
    });
};

// --- Controllers ---

// 1. Upload & Create Note
exports.createNote = async (req, res) => {
    try {
        const { title, description, language_id, is_active, status } = req.body;
        const file = req.file;
        const userRole = req.user.role;

        if (!file) {
            return res.status(400).json({ message: 'PDF file is required' });
        }
        if (!title || !language_id) {
            // Cleanup file if validation fails
            deleteFile(file.path);
            return res.status(400).json({ message: 'Title and Language are required' });
        }

        const fileUrl = `/uploads/notes/${file.filename}`;

        // Enforce Status
        let initialStatus = 'draft';
        if (userRole === 'admin' && status) {
            initialStatus = status;
        } else if (status === 'pending_review') {
            initialStatus = 'pending_review';
        }

        const submittedAt = initialStatus === 'pending_review' ? new Date() : null;

        await db.query(
            'INSERT INTO notes (title, description, language_id, file_url, is_active, created_by, status, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description || '', language_id, fileUrl, is_active === 'true' || is_active === true, req.user.id, initialStatus, submittedAt]
        );

        res.status(201).json({ message: 'Note uploaded successfully', fileUrl });
    } catch (err) {
        console.error(err);
        if (req.file) deleteFile(req.file.path);
        res.status(500).json({ message: 'Server error' });
    }
};

// 2. Get All Notes (CM View)
exports.getNotes = async (req, res) => {
    try {
        const { language_id } = req.query;
        let query = `
            SELECT n.*, l.name as language_name, u.name as created_by_name, u_d.name as disabled_by_name
            FROM notes n
            LEFT JOIN languages l ON n.language_id = l.id
            LEFT JOIN users u ON n.created_by = u.id
            LEFT JOIN users u_d ON n.disabled_by = u_d.id
            WHERE 1=1
        `;
        const params = [];

        if (language_id) {
            query += ' AND n.language_id = ?';
            params.push(language_id);
        }

        query += ' ORDER BY n.created_at DESC';

        const [notes] = await db.query(query, params);
        res.json(notes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 3. Get Notes for Students (Public/Active Only)
exports.getPublicNotes = async (req, res) => {
    try {
        const { language_id } = req.query;
        let query = `
            SELECT n.id, n.title, n.description, n.file_url, n.created_at, l.name as language_name
            FROM notes n
            JOIN languages l ON n.language_id = l.id
            WHERE n.is_active = TRUE AND n.status = 'published'
        `;
        const params = [];

        if (language_id) {
            query += ' AND n.language_id = ?';
            params.push(language_id);
        }

        query += ' ORDER BY l.name ASC, n.title ASC';

        const [notes] = await db.query(query, params);
        res.json(notes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 4. Update Note
exports.updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, language_id, is_active, status } = req.body;
        const file = req.file;
        const userRole = req.user.role;

        const [existing] = await db.query('SELECT * FROM notes WHERE id = ?', [id]);
        if (existing.length === 0) {
            if (file) deleteFile(file.path);
            return res.status(404).json({ message: 'Note not found' });
        }

        const note = existing[0];
        let fileUrl = note.file_url;

        // If new file uploaded, delete old one
        if (file) {
            const oldPath = path.join(__dirname, '..', note.file_url);
            fs.unlink(oldPath, (err) => { });
            fileUrl = `/uploads/notes/${file.filename}`;
        }

        // Status Logic
        let newStatus = undefined;
        let submittedAt = undefined;
        if (status) {
            if (userRole === 'admin') {
                newStatus = status;
            } else if (['draft', 'pending_review'].includes(status)) {
                newStatus = status;
                if (status === 'pending_review') submittedAt = new Date();
                else submittedAt = null;
            }
        }

        let query = 'UPDATE notes SET title = ?, description = ?, language_id = ?, file_url = ?, is_active = ?';
        let params = [title, description, language_id, fileUrl, is_active === 'true' || is_active === true];

        if (newStatus) {
            query += ', status = ?, submitted_at = ?';
            params.push(newStatus);
            params.push(submittedAt);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.query(query, params);

        res.json({ message: 'Note updated successfully', fileUrl });
    } catch (err) {
        console.error(err);
        if (req.file) deleteFile(req.file.path);
        res.status(500).json({ message: 'Server error' });
    }
};

// 5. Toggle Status
exports.toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        await db.query('UPDATE notes SET is_active = ? WHERE id = ?', [is_active, id]);
        res.json({ message: 'Status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 6. Request Delete
exports.requestDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await db.query('SELECT * FROM notes WHERE id = ?', [id]);

        if (note.length === 0) return res.status(404).json({ message: 'Note not found' });

        // Update status to pending_delete
        await db.query('UPDATE notes SET status = ?, submitted_at = NOW() WHERE id = ?', ['pending_delete', id]);

        res.json({ message: 'Deletion requested successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 6. Get Single Public Note
exports.getPublicNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT n.id, n.title, n.description, n.file_url, n.created_at, l.name as language_name
            FROM notes n
            JOIN languages l ON n.language_id = l.id
            WHERE n.id = ? AND n.is_active = TRUE AND n.status = 'published'
        `;
        const [notes] = await db.query(query, [id]);

        if (notes.length === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.json(notes[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
