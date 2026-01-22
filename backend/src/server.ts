import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Phase: 0 (Admission Module Only)`);
});
