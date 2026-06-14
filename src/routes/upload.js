const express = require('express');
const multer = require('multer');
const supabase = require('../config/supabaseStorage');
const auth = require('../middleware/auth');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/chat', auth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Nessun file' });
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.originalname}`;
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET)
      .upload(fileName, file.buffer, { contentType: file.mimetype });
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(fileName);
    res.json({ fileUrl: publicUrlData.publicUrl, fileName: file.originalname });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;