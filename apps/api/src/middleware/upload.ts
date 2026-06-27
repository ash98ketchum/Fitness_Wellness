import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Configure Multer for local uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // In a production app, use process.cwd() instead of __dirname if running from dist
    const dir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\\s+/g, '_')}`);
  }
});

export const upload = multer({ storage });
