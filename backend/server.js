const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const authRoutes = require('./routes/authRoutes');
const languageRoutes = require('./routes/languageRoutes');
const topicRoutes = require('./routes/topicRoutes');
const questionRoutes = require('./routes/questionRoutes');
const codeRoutes = require('./routes/codeRoutes');
const userRoutes = require('./routes/userRoutes');
const subtopicRoutes = require('./routes/subtopicRoutes');
const progressRoutes = require('./routes/progressRoutes');
const aiRoutes = require('./routes/aiRoutes');
const contentRoutes = require('./routes/contentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subtopics', subtopicRoutes);
app.use('/api/user/progress', progressRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/content', contentRoutes);

app.use('/api/training-exams', require('./routes/trainingExamRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));

app.get('/', (req, res) => {
    res.send('CodeWise API is running');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
