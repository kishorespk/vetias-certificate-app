const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// --- CONFIGURATION ---
const PORT = process.env.PORT || 3000; // Render needs this
// ⚠️ Read keys from Render's Environment Variables
const CLOUD_NAME = process.env.CLOUD_NAME; 
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET; 
// --- END CONFIGURATION ---

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true
});

// Set up Express app and Multer for file handling
const app = express();
const upload = multer({ dest: 'temp_uploads/' }); 


// Serve the HTML file at the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- CORE UPLOAD ENDPOINT ---
app.post('/api/upload-certificate', upload.single('certificate_file'), async (req, res) => {
    
    // Get form data: student_name, roll_number, and the file
    const { student_name, roll_number } = req.body;
    const uploadedFile = req.file;

    if (!uploadedFile) {
        return res.status(400).send('No file uploaded.');
    }
    
    try {
        // --- 🔑 DYNAMIC FOLDER CREATION LOGIC IS HERE ---
        // 1. Base Folder: VETIAS_CERTIFICATES
        // 2. Sub-Folder (created by Roll Number): 24CSC16
        // Resulting path on Cloudinary: VETIAS_CERTIFICATES/24CSC16
        const baseFolder = "VETIAS_CERTIFICATES"; 
        const studentFolder = roll_number.toUpperCase().trim().replace(/[^A-Z0-9]/g, '_'); // Clean up Roll Number for folder name
        
        const finalFolderPath = `${baseFolder}/${studentFolder}`; 
        
        // Use filename and student name for a unique, readable public ID
        const publicId = `${student_name.replace(/\s/g, '_')}_${Date.now()}`; 
        // --- 🔑 END LOGIC ---

        // Upload the file from the local temporary path to Cloudinary
        const result = await cloudinary.uploader.upload(uploadedFile.path, {
            folder: finalFolderPath, // This creates the new Roll Number folder!
            public_id: publicId,
            resource_type: 'auto' 
        });
        
        // Success response
        res.send(`Success! Certificate uploaded to folder: ${studentFolder}. View link: ${result.secure_url}`);

    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        res.status(500).send(`❌ Upload Failed: Please check API keys or server logs.`);
    } finally {
        // CLEANUP: Delete the temporary file from the server's disk
        if (uploadedFile && fs.existsSync(uploadedFile.path)) {
            fs.unlinkSync(uploadedFile.path); 
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});