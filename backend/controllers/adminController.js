const db = require('../config/db');
const bcrypt = require('bcryptjs');

// --- Helper: Log Action ---
const logAdminAction = async (adminId, action, targetType, targetId, details) => {
    try {
        await db.query(
            'INSERT INTO audit_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [adminId, action, targetType, targetId, JSON.stringify(details)]
        );
    } catch (err) {
        console.error('Audit Log Error:', err);
    }
};

// ... (existing code for getStats, getReviewQueue, getReviewItemDetails, reviewItem, getAuditLogs, getContentManagers)

exports.createContentManager = async (req, res) => {
    const { name, email, password } = req.body;
    const adminId = req.user.id;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check existing
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert
        const [result] = await db.query(
            "INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, 'content_manager', TRUE)",
            [name, email, hashedPassword]
        );

        // Audit Log
        await logAdminAction(adminId, 'create_user', 'user', result.insertId, { name, email });

        res.status(201).json({ message: 'Content Manager created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getContentManagers = async (req, res) => {
    try {
        const [users] = await db.query("SELECT id, name, email, role, is_active, created_at, last_active FROM users WHERE role = 'content_manager'");
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.toggleUserStatus = async (req, res) => {
    // ... existing code
    const { id } = req.params;
    const { is_active } = req.body;
    const adminId = req.user.id;

    try {
        await db.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, id]);

        // Audit Log
        await logAdminAction(adminId, is_active ? 'activate_user' : 'deactivate_user', 'user', id, { is_active });

        res.json({ message: 'User status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Helper: Get Review Queue Stats ---
exports.getStats = async (req, res) => {
    try {
        const [questions] = await db.query("SELECT COUNT(*) as count FROM questions WHERE status = 'pending_review'");
        const [notes] = await db.query("SELECT COUNT(*) as count FROM notes WHERE status = 'pending_review'");
        const [exams] = await db.query("SELECT COUNT(*) as count FROM exams WHERE status = 'pending_review'");

        const [published] = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM questions WHERE status = 'published') + 
                (SELECT COUNT(*) FROM notes WHERE status = 'published') + 
                (SELECT COUNT(*) FROM exams WHERE status = 'published') as count
        `);

        const [disabled] = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM questions WHERE status = 'disabled') + 
                (SELECT COUNT(*) FROM notes WHERE status = 'disabled') + 
                (SELECT COUNT(*) FROM exams WHERE status = 'disabled') as count
        `);

        res.json({
            pending_questions: questions[0].count,
            pending_notes: notes[0].count,
            pending_exams: exams[0].count,
            published_items: published[0].count,
            disabled_items: disabled[0].count
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Review Queue ---
exports.getReviewQueue = async (req, res) => {
    try {
        const { type } = req.query; // 'question', 'notes', 'exam'
        let items = [];

        if (!type || type === 'question') {
            const [q] = await db.query(`SELECT id, title, description, difficulty, created_at, 'question' as type FROM questions WHERE status = 'pending_review'`);
            items = [...items, ...q];
        }
        if (!type || type === 'notes') {
            const [n] = await db.query(`SELECT id, title, description, created_at, status, 'notes' as type FROM notes WHERE status IN ('pending_review', 'pending_delete')`);
            items = [...items, ...n];
        }
        if (!type || type === 'exam') {
            const [e] = await db.query(`SELECT id, title, description, created_at, 'exam' as type FROM exams WHERE status = 'pending_review'`);
            items = [...items, ...e];
        }

        items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Get Full Item Details for Review ---
exports.getReviewItemDetails = async (req, res) => {
    const { type, id } = req.params;
    try {
        let item = null;
        if (type === 'question') {
            const [q] = await db.query('SELECT * FROM questions WHERE id = ?', [id]);
            if (q.length) item = q[0];
        } else if (type === 'notes') {
            const [n] = await db.query('SELECT n.*, l.name as language_name FROM notes n LEFT JOIN languages l ON n.language_id = l.id WHERE n.id = ?', [id]);
            if (n.length) item = n[0];
        } else if (type === 'exam') {
            const [e] = await db.query('SELECT * FROM exams WHERE id = ?', [id]);
            if (e.length) item = e[0];
            // Fetch questions for exam if needed
            // Fetch questions for exam with details
            const [eq] = await db.query(`
                SELECT eq.*, q.title, q.description, q.type as question_type, q.difficulty, q.correct_option, q.options, q.model_answer 
                FROM exam_questions eq 
                JOIN questions q ON eq.question_id = q.id 
                WHERE eq.exam_id = ? 
                ORDER BY eq.module, eq.order_index
            `, [id]);
            item.questions = eq;
        }

        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Review Actions ---
exports.reviewItem = async (req, res) => {
    const { type, id } = req.params;
    const { action, comment } = req.body; // action: 'approve', 'reject'
    const adminId = req.user.id;

    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action' });
    }

    const newStatus = action === 'approve' ? 'published' : 'rejected';
    const table = type === 'question' ? 'questions' : type === 'notes' ? 'notes' : 'exams';

    const isActive = newStatus === 'published' ? 1 : 0; // Or keep 0 if rejected? Maybe keep current state if rejected, but definitely 1 if published.
    // Actually simpler: If published, make active. If rejected, usually it goes back to draft, so active/inactive depends. 
    // But safely, let's just say if published, is_active=1. 

    let updateQuery = `UPDATE ${table} SET status = ?, reviewed_by = ?, reviewed_at = NOW(), review_comment = ?`;
    const params = [newStatus, adminId, comment || ''];

    // Only update is_active for questions and notes, as exams might not have this column
    if (newStatus === 'published' && table !== 'exams') {
        updateQuery += `, is_active = 1`;
    }

    updateQuery += ` WHERE id = ?`;
    params.push(id);

    try {
        // Check if it's a deletion request (only for notes/questions potentially, but here implemented for notes)
        if (type === 'notes') {
            const [currentItem] = await db.query('SELECT status, file_url FROM notes WHERE id = ?', [id]);

            if (currentItem.length && currentItem[0].status === 'pending_delete') {
                if (action === 'approve') {
                    // Permanently delete
                    await db.query('DELETE FROM notes WHERE id = ?', [id]);
                    // Also delete file
                    const fs = require('fs');
                    const path = require('path');
                    const filePath = path.join(__dirname, '..', currentItem[0].file_url);
                    fs.unlink(filePath, (err) => { if (err) console.error('Failed to delete file:', err); });

                    return res.json({ message: 'Item permanently deleted' });
                } else {
                    // Reject deletion -> Revert to published/active
                    await db.query('UPDATE notes SET status = "published", is_active = 1 WHERE id = ?', [id]);
                    return res.json({ message: 'Deletion request rejected, item restored' });
                }
            }
        }

        await db.query(updateQuery, params);

        // Audit Log
        await logAdminAction(adminId, action, type, id, { newStatus, comment });

        res.json({ message: `Item ${action}d successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Audit Logs ---
exports.getAuditLogs = async (req, res) => {
    try {
        const [logs] = await db.query(`
            SELECT a.*, u.name as admin_name 
            FROM audit_logs a 
            JOIN users u ON a.admin_id = u.id 
            ORDER BY a.created_at DESC LIMIT 50
        `);
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.toggleLanguageStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active, reason } = req.body;
    const adminId = req.user.id;

    try {
        let query = 'UPDATE languages SET is_active = ?';
        const params = [is_active];

        if (!is_active) {
            query += ', disabled_by = ?, disabled_at = NOW(), disabled_reason = ?';
            params.push(adminId, reason || null);
        } else {
            // Optional: Clear disabled info when re-enabling
            query += ', disabled_by = NULL, disabled_at = NULL, disabled_reason = NULL';
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.query(query, params);

        // Audit Log
        await logAdminAction(adminId, is_active ? 'enable_language' : 'disable_language', 'language', id, { is_active, reason });

        res.json({ message: 'Language status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.toggleItemStatus = async (req, res) => {
    const { type, id } = req.params; // type: 'questions', 'notes', 'exams'
    const { is_active, reason } = req.body;
    const adminId = req.user.id;

    if (!['questions', 'notes', 'exams'].includes(type)) {
        return res.status(400).json({ message: 'Invalid item type' });
    }

    try {
        let query = '';
        let params = [];
        let action = '';
        const status = is_active ? 'published' : 'disabled';

        // Update queries based on type
        if (type === 'exams') {
            query = 'UPDATE exams SET status = ?';
            params = [status];
        } else {
            // questions and notes have is_active AND status
            query = `UPDATE ${type} SET is_active = ?, status = ?`;
            params = [is_active, status];
        }

        if (!is_active) {
            query += ', disabled_by = ?, disabled_at = NOW(), disabled_reason = ?';
            params.push(adminId, reason || null);
        } else {
            query += ', disabled_by = NULL, disabled_at = NULL, disabled_reason = NULL';
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.query(query, params);

        action = is_active ? `restore_${type.slice(0, -1)}` : `disable_${type.slice(0, -1)}`;

        // Audit Log
        await logAdminAction(adminId, action, type.slice(0, -1), id, { is_active, reason });

        res.json({ message: `${type} status updated` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Delete User (with cleanup) ---
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;

    if (id == adminId) {
        return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Delete Dependencies (or set NULL if appropriate)

        // Notes: If user created notes, either delete them or set created_by to NULL. 
        // Strategy: Set to NULL so content remains. Or if strictly personal, delete. 
        // Typically content ownership might be transferred to admin or NULL. let's set NULL.
        await connection.query('UPDATE notes SET created_by = NULL WHERE created_by = ?', [id]);

        // Issue Reports: Set reported_by to NULL or Delete? Reports are valuable. Set NULL but keep name if possible?
        // Current table likely has FK. Set NULL.
        // reported_issues has no FK on reported_by_user_id, so we don't need to do anything. 
        // The column reported_by doesn't exist. reported_by_user_id exists but is NOT NULL. 
        // We leave it as is. The user is deleted, but the report remains with the ID.
        // await connection.query('UPDATE reported_issues SET reported_by = NULL WHERE reported_by = ?', [id]);

        // Audit Logs: 
        // Schema says admin_id is NOT NULL and has ON DELETE CASCADE. 
        // So we DO NOT set to NULL. Deleting the user will delete their logs automatically.
        // await connection.query('UPDATE audit_logs SET admin_id = NULL WHERE admin_id = ?', [id]);

        // Content Manager disabled items
        await connection.query('UPDATE languages SET disabled_by = NULL WHERE disabled_by = ?', [id]);
        // Also exams, notes, questions disabled_by
        await connection.query('UPDATE notes SET disabled_by = NULL WHERE disabled_by = ?', [id]);
        await connection.query('UPDATE questions SET disabled_by = NULL WHERE disabled_by = ?', [id]);
        await connection.query('UPDATE exams SET disabled_by = NULL WHERE disabled_by = ?', [id]);

        // Review items? reviewed_by
        await connection.query('UPDATE questions SET reviewed_by = NULL WHERE reviewed_by = ?', [id]);
        await connection.query('UPDATE notes SET reviewed_by = NULL WHERE reviewed_by = ?', [id]);
        await connection.query('UPDATE exams SET reviewed_by = NULL WHERE reviewed_by = ?', [id]);

        // User Question Status (Progress) - Delete this as it's user specific
        await connection.query('DELETE FROM user_question_status WHERE user_id = ?', [id]);

        // Exam Results - Table might not exist or verify name. 
        // Based on schema check: exam_results doesn't exist. 
        // If there is an equivalent table (e.g. user_exams or something), we should check.
        // For now, remove to prevent crash.
        // await connection.query('DELETE FROM exam_results WHERE user_id = ?', [id]);

        // Finally Delete User
        await connection.query('DELETE FROM users WHERE id = ?', [id]);

        await connection.commit();

        // Log this action (using specific logAdminAction or manual insert since adminController usually has db pool, passing connection might strictly be needed if we want atomicity in log?)
        // Logging after commit is fine.
        await logAdminAction(adminId, 'delete_user', 'user', id, {});

        res.json({ message: 'User permanently deleted' });

    } catch (err) {
        await connection.rollback();
        console.error('DELETE USER ERROR:', err);
        res.status(500).json({ message: 'Failed to delete user', error: err.message });
    } finally {
        connection.release();
    }
};
