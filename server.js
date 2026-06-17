const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// --- CONFIGURATION ---
const PORT = process.env.PORT || 3000; // Render needs this
// --- END CONFIGURATION ---

// Configure Cloudinary with your exact credentials
cloudinary.config({
    cloud_name: 'djocjzlgt', 
    api_key: '215754899971461',    
    api_secret: 'hdc3vkUzovFQF5-Fqy016pK5q9A', 
    secure: true
});

// Set up Express app and Multer for temporary file handling
const app = express();
const upload = multer({ dest: 'temp_uploads/' }); 

// Middleware to parse urlencoded form fields
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the HTML file at the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- CORE UPLOAD ENDPOINT ---
app.post('/api/upload-certificate', upload.single('certificate_file'), async (req, res) => {
    
    // Get all explicit form data from frontend packets
    const { student_name, roll_number, department_name, academic_year, certificate_name } = req.body;
    const uploadedFile = req.file;

    if (!uploadedFile) {
        return res.status(400).send('No file uploaded.');
    }
    
    try {
        // --- 🔑 NEW MULTI-LEVEL DYNAMIC FOLDER LOGIC ---
        // 1. Fallback strings validation loops check
        const dept = department_name || 'General_Pool';
        const year = academic_year || 'Unknown_Year';
        const roll = (roll_number || 'UNKNOWN').toUpperCase().trim();
        const cert = certificate_name || 'Certificate';

        // 2. Formatting clean names (spaces, dots, text patterns to "_")
        const deptFolder = dept.replace(/[^a-zA-Z0-9]/g, '_');
        const yearFolder = year.replace(/[^a-zA-Z0-9]/g, '_');
        const cleanCertName = cert.replace(/[^a-zA-Z0-9]/g, '_');

        // Base Folder Path setup for Cloudinary Dashboard: VETIAS/B_Sc__Computer_Science/III_Year
        const finalFolderPath = `VETIAS/${deptFolder}/${yearFolder}`; 
        
        // 3. ✨ FILE NAME FORMAT: RollNumber_CertificateName
        // No more random timestamps! Strict and professional naming structure.
        const publicId = `${roll}_${cleanCertName}`; 
        // --- 🔑 END LOGIC ---

        // Upload the file from the local temporary path to Cloudinary
        const result = await cloudinary.uploader.upload(uploadedFile.path, {
            folder: finalFolderPath, // Auto creates Department and Year sub-folders in Cloudinary!
            public_id: publicId,
            resource_type: 'auto' 
        });
        
        // Success response text passed back to frontend animated modal
        res.send(`Successfully organized into ${deptFolder} -> ${yearFolder}. File Name: ${publicId}`);

    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        res.status(500).send(`❌ Upload Failed: Internal Server Error or Keys Misconfiguration.`);
    } finally {
        // CLEANUP: Delete the temporary file from Render's local temporary disk space immediately
        if (uploadedFile && fs.existsSync(uploadedFile.path)) {
            fs.unlinkSync(uploadedFile.path); 
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`VETIAS Storage Engine Node Server completely running on port: ${PORT}`);
});
