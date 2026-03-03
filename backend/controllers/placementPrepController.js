const db = require('../config/db');

// Helper to log placement activity
const logPlacementActivity = async (connection, cmId, action_type, entity_type, entity_id, company_id, description) => {
    if (!cmId) return; // For safety
    try {
        const query = `INSERT INTO placement_activity_logs (content_manager_id, action_type, entity_type, entity_id, company_id, description) VALUES (?, ?, ?, ?, ?, ?)`;
        await connection.query(query, [cmId, action_type, entity_type, entity_id, company_id, description]);
    } catch (e) {
        console.error('Failed to log placement activity:', e);
    }
};

// --- Companies ---

exports.getCompanies = async (req, res) => {
    try {
        const query = `
            SELECT c.*,
            (SELECT COUNT(*) FROM placement_questions WHERE company_id = c.id AND type = 'technical') as technical_count,
            (SELECT COUNT(*) FROM placement_questions WHERE company_id = c.id AND type = 'hr') as hr_count
            FROM companies c
            ORDER BY c.created_at ASC
        `;
        const [companies] = await db.query(query);
        res.json(companies);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCompanyDetails = async (req, res) => {
    try {
        const companyId = req.params.id;
        const isNumeric = /^\d+$/.test(companyId);
        let condition = isNumeric ? 'c.id = ?' : 'c.slug = ?';

        const query = `
            SELECT c.*,
            (SELECT COUNT(*) FROM placement_questions WHERE company_id = c.id AND type = 'technical') as technical_count,
            (SELECT COUNT(*) FROM placement_questions WHERE company_id = c.id AND type = 'hr') as hr_count,
            (SELECT MAX(updated_at) FROM placement_questions WHERE company_id = c.id AND type = 'technical') as technical_updated,
            (SELECT MAX(updated_at) FROM placement_questions WHERE company_id = c.id AND type = 'hr') as hr_updated
            FROM companies c
            WHERE ${condition}
        `;
        const [companies] = await db.query(query, [companyId]);

        if (companies.length === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.json(companies[0]);
    } catch (error) {
        console.error('Error fetching company details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addCompany = async (req, res) => {
    try {
        const { name, description } = req.body;
        const logo_path = req.file ? req.file.filename : null;

        // Basic validation
        if (!name) {
            return res.status(400).json({ message: 'Company name is required' });
        }

        const query = `INSERT INTO companies (name, slug, description, logo_url, logo_path) VALUES (?, ?, ?, NULL, ?)`;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const [result] = await db.query(query, [name, slug, description || null, logo_path]);

        res.status(201).json({ message: 'Company added successfully', id: result.insertId, logo_path });

        // Log action (non-blocking)
        logPlacementActivity(db, req.user?.id, 'add', 'company', result.insertId, result.insertId, `Added new company profile for ${name}`);
    } catch (error) {
        console.error('Error adding company:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Company name already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const companyId = req.params.id;
        const { name, description, remove_logo } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Company name is required' });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        let logo_path_clause = '';
        let queryParams = [name, slug, description || null];

        if (req.file) {
            logo_path_clause = ', logo_path = ?';
            queryParams.push(req.file.filename);
        } else if (remove_logo === 'true') {
            logo_path_clause = ', logo_path = NULL';
        }

        queryParams.push(companyId);

        const query = `UPDATE companies SET name = ?, slug = ?, description = ?${logo_path_clause} WHERE id = ?`;
        const [result] = await db.query(query, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const logoPathRes = req.file ? req.file.filename : (remove_logo === 'true' ? null : undefined);
        res.json({ message: 'Company updated successfully', logo_path: logoPathRes });

        logPlacementActivity(db, req.user?.id, 'edit', 'company', companyId, companyId, `Updated company profile for ${name}`);
    } catch (error) {
        console.error('Error updating company:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Company name already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCompany = async (req, res) => {
    try {
        const companyId = req.params.id;

        const query = `DELETE FROM companies WHERE id = ?`;
        const [result] = await db.query(query, [companyId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json({ message: 'Company deleted successfully' });

        logPlacementActivity(db, req.user?.id, 'delete', 'company', companyId, companyId, `Deleted company profile`);
    } catch (error) {
        console.error('Error deleting company:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Modules ---

exports.getModules = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const query = `
            SELECT m.*,
            (SELECT COUNT(*) FROM placement_questions WHERE module_id = m.id) as question_count,
            (SELECT MAX(updated_at) FROM placement_questions WHERE module_id = m.id) as last_updated
            FROM company_modules m
            WHERE m.company_id = ?
            ORDER BY m.display_order ASC
        `;
        const [modules] = await db.query(query, [companyId]);
        res.json(modules);
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addModule = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const { module_name, module_type, description } = req.body;

        if (!module_name || !module_type) {
            return res.status(400).json({ message: 'Module name and type are required' });
        }

        // Validate duplicates
        const [existing] = await db.query(`SELECT id FROM company_modules WHERE company_id = ? AND module_name = ?`, [companyId, module_name]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'A module with this name already exists for this company.' });
        }

        // Get max display_order
        const [maxRes] = await db.query(`SELECT IFNULL(MAX(display_order), 0) as max_order FROM company_modules WHERE company_id = ?`, [companyId]);
        const nextOrder = maxRes[0].max_order + 1;

        const query = `INSERT INTO company_modules (company_id, module_name, module_type, description, display_order) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.query(query, [companyId, module_name, module_type, description || null, nextOrder]);

        logPlacementActivity(db, req.user?.id, 'add', 'module', result.insertId, companyId, `Added new interview module: ${module_name}`);
        res.status(201).json({ message: 'Module added successfully', id: result.insertId });
    } catch (error) {
        console.error('Error adding module:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateModule = async (req, res) => {
    try {
        const moduleId = req.params.id;
        const { module_name, module_type, description } = req.body;

        if (!module_name || !module_type) {
            return res.status(400).json({ message: 'Module name and type are required' });
        }

        const [existing] = await db.query(`SELECT company_id FROM company_modules WHERE id = ?`, [moduleId]);
        if (existing.length === 0) return res.status(404).json({ message: 'Module not found' });
        const companyId = existing[0].company_id;

        // Check duplicates excluding current
        const [dup] = await db.query(`SELECT id FROM company_modules WHERE company_id = ? AND module_name = ? AND id != ?`, [companyId, module_name, moduleId]);
        if (dup.length > 0) return res.status(400).json({ message: 'A module with this name already exists for this company.' });

        const query = `UPDATE company_modules SET module_name = ?, module_type = ?, description = ? WHERE id = ?`;
        await db.query(query, [module_name, module_type, description || null, moduleId]);

        logPlacementActivity(db, req.user?.id, 'edit', 'module', moduleId, companyId, `Updated interview module: ${module_name}`);
        res.json({ message: 'Module updated successfully' });
    } catch (error) {
        console.error('Error updating module:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteModule = async (req, res) => {
    try {
        const moduleId = req.params.id;

        const [existing] = await db.query(`SELECT company_id, module_name FROM company_modules WHERE id = ?`, [moduleId]);
        if (existing.length === 0) return res.status(404).json({ message: 'Module not found' });

        const companyId = existing[0].company_id;
        const moduleName = existing[0].module_name;

        const [questions] = await db.query(`SELECT id FROM placement_questions WHERE module_id = ?`, [moduleId]);
        if (questions.length > 0) {
            return res.status(400).json({ message: 'Cannot delete module because it contains questions. Move or delete the questions first.' });
        }

        await db.query(`DELETE FROM company_modules WHERE id = ?`, [moduleId]);

        logPlacementActivity(db, req.user?.id, 'delete', 'module', moduleId, companyId, `Deleted interview module: ${moduleName}`);
        res.json({ message: 'Module deleted successfully' });
    } catch (error) {
        console.error('Error deleting module:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getQuestions = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const { moduleId } = req.query;

        if (!moduleId) {
            return res.status(400).json({ message: 'Invalid or missing module ID' });
        }

        // Fetch questions
        let query = `
            SELECT * FROM placement_questions 
            WHERE company_id = ? AND module_id = ?
            ORDER BY display_order ASC
        `;
        const [questions] = await db.query(query, [companyId, moduleId]);

        if (questions.length === 0) {
            return res.json([]);
        }

        // Fetch related points and tags for all questions returned
        const questionIds = questions.map(q => q.id);

        // Fetch points
        const pointsQuery = `SELECT * FROM placement_question_points WHERE question_id IN (?)`;
        const [points] = await db.query(pointsQuery, [questionIds]);

        // Fetch tags
        const tagsQuery = `SELECT * FROM placement_question_tags WHERE question_id IN (?)`;
        const [tags] = await db.query(tagsQuery, [questionIds]);

        // Map points and tags to their respective questions
        questions.forEach(q => {
            q.points = points.filter(p => p.question_id === q.id).map(p => p.bullet_text);
            q.tags = tags.filter(t => t.question_id === q.id).map(t => t.tag_name);
        });

        res.json(questions);
    } catch (error) {
        console.error('Error fetching placement questions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPublicQuestions = async (req, res) => {
    try {
        const identifier = req.params.companyId;
        const { moduleId } = req.query;

        if (!moduleId) {
            return res.status(400).json({ message: 'Invalid or missing module ID' });
        }

        // 1. Resolve company ID
        const isNumeric = /^\\d+$/.test(identifier);
        let companyQuery = isNumeric ? `SELECT id FROM companies WHERE id = ?` : `SELECT id FROM companies WHERE slug = ?`;
        const [companies] = await db.query(companyQuery, [identifier]);

        if (companies.length === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }
        const companyId = companies[0].id;

        // Fetch ACTIVE questions
        let query = `
            SELECT * FROM placement_questions 
            WHERE company_id = ? AND module_id = ? AND is_active = true
            ORDER BY display_order ASC
        `;
        const [questions] = await db.query(query, [companyId, moduleId]);

        if (questions.length === 0) {
            return res.json([]);
        }

        const questionIds = questions.map(q => q.id);

        const pointsQuery = `SELECT * FROM placement_question_points WHERE question_id IN (?)`;
        const [points] = await db.query(pointsQuery, [questionIds]);

        const tagsQuery = `SELECT * FROM placement_question_tags WHERE question_id IN (?)`;
        const [tags] = await db.query(tagsQuery, [questionIds]);

        questions.forEach(q => {
            q.points = points.filter(p => p.question_id === q.id).map(p => p.bullet_text);
            q.tags = tags.filter(t => t.question_id === q.id).map(t => t.tag_name);
        });

        res.json(questions);
    } catch (error) {
        console.error('Error fetching public placement questions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPublicCompanyDetails = async (req, res) => {
    try {
        const identifier = req.params.companyId;
        const isNumeric = /^\\d+$/.test(identifier);
        let query = isNumeric ? `SELECT * FROM companies WHERE id = ?` : `SELECT * FROM companies WHERE slug = ?`;
        const [companies] = await db.query(query, [identifier]);

        if (companies.length === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.json(companies[0]);
    } catch (error) {
        console.error('Error fetching public company details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPublicModules = async (req, res) => {
    try {
        const identifier = req.params.companyId;
        const isNumeric = /^\\d+$/.test(identifier);
        let cQuery = isNumeric ? `SELECT id FROM companies WHERE id = ?` : `SELECT id FROM companies WHERE slug = ?`;
        const [companies] = await db.query(cQuery, [identifier]);

        if (companies.length === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }
        const companyId = companies[0].id;

        const query = `
            SELECT m.*,
            (SELECT COUNT(*) FROM placement_questions WHERE module_id = m.id AND is_active = true) as question_count
            FROM company_modules m
            WHERE m.company_id = ?
            ORDER BY m.display_order ASC
        `;
        const [modules] = await db.query(query, [companyId]);
        res.json(modules);
    } catch (error) {
        console.error('Error fetching public modules:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPublicCompanies = async (req, res) => {
    try {
        const query = `
            SELECT c.*,
            (SELECT COUNT(*) FROM company_modules WHERE company_id = c.id) as modules_count,
            (SELECT COUNT(*) FROM placement_questions WHERE company_id = c.id AND is_active = true) as total_questions
            FROM companies c
            ORDER BY c.created_at ASC
        `;
        const [companies] = await db.query(query);
        res.json(companies);
    } catch (error) {
        console.error('Error fetching public companies:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addQuestion = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const companyId = req.params.companyId;
        const { moduleId, question_title, detailed_answer, difficulty, points, tags } = req.body;

        if (!question_title || !moduleId) {
            await connection.rollback();
            return res.status(400).json({ message: 'Question title and valid module are required' });
        }

        const [modInfo] = await connection.query(`SELECT module_type, module_name FROM company_modules WHERE id = ? AND company_id = ?`, [moduleId, companyId]);
        if (modInfo.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Module not found' });
        }
        const type = modInfo[0].module_type.toLowerCase();

        // Get current max display_order
        const maxOrderQuery = `SELECT IFNULL(MAX(display_order), 0) as max_order FROM placement_questions WHERE company_id = ? AND module_id = ?`;
        const [maxResult] = await connection.query(maxOrderQuery, [companyId, moduleId]);
        const nextOrder = maxResult[0].max_order + 1;

        // Insert question
        const qQuery = `INSERT INTO placement_questions (company_id, module_id, type, question_title, detailed_answer, difficulty, created_by, last_modified_by, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [qResult] = await connection.query(qQuery, [companyId, moduleId, type, question_title, detailed_answer || null, difficulty || 'medium', req.user?.id || null, req.user?.id || null, nextOrder]);
        const questionId = qResult.insertId;

        // Insert points (if any)
        if (points && Array.isArray(points) && points.length > 0) {
            const pQuery = `INSERT INTO placement_question_points (question_id, bullet_text) VALUES ?`;
            const pValues = points.filter(p => p.trim() !== '').map(p => [questionId, p.trim()]);
            if (pValues.length > 0) {
                await connection.query(pQuery, [pValues]);
            }
        }

        // Insert tags (if any)
        if (tags && Array.isArray(tags) && tags.length > 0) {
            const tQuery = `INSERT INTO placement_question_tags (question_id, tag_name) VALUES ?`;
            const tValues = tags.filter(t => t.trim() !== '').map(t => [questionId, t.trim()]);
            if (tValues.length > 0) {
                await connection.query(tQuery, [tValues]);
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Question added successfully', id: questionId });

        logPlacementActivity(db, req.user?.id, 'add', 'question', questionId, companyId, `Added question to module: ${modInfo[0].module_name}`);
    } catch (error) {
        await connection.rollback();
        console.error('Error adding question:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
};

exports.updateQuestion = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const questionId = req.params.id;
        const { question_title, detailed_answer, difficulty, points, tags } = req.body;

        if (!question_title) {
            await connection.rollback();
            return res.status(400).json({ message: 'Question title is required' });
        }

        // Fetch existing question to get company_id and type for logging
        const [existing] = await connection.query(`SELECT pq.company_id, pq.type, m.module_name FROM placement_questions pq LEFT JOIN company_modules m ON pq.module_id = m.id WHERE pq.id = ?`, [questionId]);
        if (existing.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Question not found' });
        }
        const companyId = existing[0].company_id;
        const moduleName = existing[0].module_name || existing[0].type;

        // Update question record
        const qQuery = `UPDATE placement_questions SET question_title = ?, detailed_answer = ?, difficulty = ?, last_modified_by = ? WHERE id = ?`;
        const [qResult] = await connection.query(qQuery, [question_title, detailed_answer || null, difficulty || 'medium', req.user?.id || null, questionId]);

        if (qResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Question not found' });
        }

        // Replace points (Delete old, insert new)
        await connection.query(`DELETE FROM placement_question_points WHERE question_id = ?`, [questionId]);
        if (points && Array.isArray(points) && points.length > 0) {
            const pQuery = `INSERT INTO placement_question_points (question_id, bullet_text) VALUES ?`;
            const pValues = points.filter(p => p.trim() !== '').map(p => [questionId, p.trim()]);
            if (pValues.length > 0) {
                await connection.query(pQuery, [pValues]);
            }
        }

        // Replace tags (Delete old, insert new)
        await connection.query(`DELETE FROM placement_question_tags WHERE question_id = ?`, [questionId]);
        if (tags && Array.isArray(tags) && tags.length > 0) {
            const tQuery = `INSERT INTO placement_question_tags (question_id, tag_name) VALUES ?`;
            const tValues = tags.filter(t => t.trim() !== '').map(t => [questionId, t.trim()]);
            if (tValues.length > 0) {
                await connection.query(tQuery, [tValues]);
            }
        }

        await connection.commit();
        res.json({ message: 'Question updated successfully' });

        logPlacementActivity(db, req.user?.id, 'edit', 'question', questionId, companyId, `Edited question in module: ${moduleName}`);
    } catch (error) {
        await connection.rollback();
        console.error('Error updating question:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const questionId = req.params.id;
        const [existing] = await db.query(`SELECT pq.company_id, pq.type, m.module_name FROM placement_questions pq LEFT JOIN company_modules m ON pq.module_id = m.id WHERE pq.id = ?`, [questionId]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }
        const companyId = existing[0].company_id;
        const moduleName = existing[0].module_name || existing[0].type;

        // Cascade delete will handle placement_question_points and placement_question_tags seamlessly
        const query = `DELETE FROM placement_questions WHERE id = ?`;
        const [result] = await db.query(query, [questionId]);

        res.json({ message: 'Question deleted successfully' });

        logPlacementActivity(db, req.user?.id, 'delete', 'question', questionId, companyId, `Deleted question from module: ${moduleName}`);
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Activity Logs & Admin Monitor ---

exports.getCMActivityLogs = async (req, res) => {
    try {
        const cmId = req.user.id;
        // Filter by query (today, week, month)
        const filter = req.query.filter || 'all';
        let timeCondition = '';
        if (filter === 'today') {
            timeCondition = 'AND created_at >= CURDATE()';
        } else if (filter === 'week') {
            timeCondition = 'AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        } else if (filter === 'month') {
            timeCondition = 'AND created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
        }

        const query = `
            SELECT l.*, c.name as company_name 
            FROM placement_activity_logs l 
            JOIN companies c ON l.company_id = c.id
            WHERE l.content_manager_id = ? ${timeCondition}
            ORDER BY l.created_at DESC
        `;
        const [logs] = await db.query(query, [cmId]);
        res.json(logs);
    } catch (error) {
        console.error('Error fetching CM activity logs:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAdminOverviewStats = async (req, res) => {
    try {
        const [companyCount] = await db.query(`SELECT COUNT(*) as count FROM companies`);
        const [techCount] = await db.query(`SELECT COUNT(*) as count FROM placement_questions WHERE type = 'technical'`);
        const [hrCount] = await db.query(`SELECT COUNT(*) as count FROM placement_questions WHERE type = 'hr'`);
        const [cmCount] = await db.query(`SELECT COUNT(DISTINCT content_manager_id) as count FROM placement_activity_logs`);

        res.json({
            total_companies: companyCount[0].count,
            total_technical: techCount[0].count,
            total_hr: hrCount[0].count,
            total_cms: cmCount[0].count
        });
    } catch (error) {
        console.error('Error fetching overview stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAdminCompaniesList = async (req, res) => {
    try {
        const query = `
            SELECT c.id, c.name, c.slug,
                   (SELECT COUNT(*) FROM placement_questions WHERE company_id = c.id AND type = 'technical') as technical_count,
                   (SELECT COUNT(*) FROM placement_questions WHERE company_id = c.id AND type = 'hr') as hr_count,
                   (SELECT MAX(created_at) FROM placement_activity_logs WHERE company_id = c.id) as last_updated,
                   (SELECT u.name FROM placement_activity_logs l JOIN users u ON l.content_manager_id = u.id WHERE l.company_id = c.id ORDER BY l.created_at DESC LIMIT 1) as last_edited_by
            FROM companies c
            ORDER BY c.created_at DESC
        `;
        const [companies] = await db.query(query);
        res.json(companies);
    } catch (error) {
        console.error('Error fetching admin companies list:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAdminCompanyQuestions = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const query = `
            SELECT pq.*, 
                   cu.name as created_by_name,
                   mu.name as modified_by_name
            FROM placement_questions pq
            LEFT JOIN users cu ON pq.created_by = cu.id
            LEFT JOIN users mu ON pq.last_modified_by = mu.id
            WHERE pq.company_id = ?
            ORDER BY pq.display_order ASC
        `;
        const [questions] = await db.query(query, [companyId]);
        res.json(questions);
    } catch (error) {
        console.error('Error fetching admin company questions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllActivityLogs = async (req, res) => {
    try {
        const { company_id, cm_id, filter } = req.query;
        let queryParams = [];
        let conditions = [];

        if (company_id) {
            conditions.push('l.company_id = ?');
            queryParams.push(company_id);
        }
        if (cm_id) {
            conditions.push('l.content_manager_id = ?');
            queryParams.push(cm_id);
        }

        if (filter === 'today') {
            conditions.push('l.created_at >= CURDATE()');
        } else if (filter === 'week') {
            conditions.push('l.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)');
        } else if (filter === 'month') {
            conditions.push('l.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)');
        }

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        const query = `
            SELECT l.*, c.name as company_name, u.name as cm_name
            FROM placement_activity_logs l 
            JOIN companies c ON l.company_id = c.id
            JOIN users u ON l.content_manager_id = u.id
            ${whereClause}
            ORDER BY l.created_at DESC
        `;
        const [logs] = await db.query(query, queryParams);
        res.json(logs);
    } catch (error) {
        console.error('Error fetching all activity logs:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.toggleQuestionStatus = async (req, res) => {
    try {
        const questionId = req.params.id;
        const { is_active } = req.body;

        const [existing] = await db.query(`SELECT company_id, type FROM placement_questions WHERE id = ?`, [questionId]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const query = `UPDATE placement_questions SET is_active = ? WHERE id = ?`;
        await db.query(query, [is_active, questionId]);

        logPlacementActivity(db, req.user?.id, is_active ? 'enable' : 'disable', 'question', questionId, existing[0].company_id, `${is_active ? 'Enabled' : 'Disabled'} ${existing[0].type} question`);

        res.json({ message: `Question ${is_active ? 'enabled' : 'disabled'} successfully` });
    } catch (error) {
        console.error('Error toggling question status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

