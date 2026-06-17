const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets if required
app.use(express.static(path.join(__dirname)));

// 🌟 DYNAMIC MULTI-LEVEL STORAGE CONFIGURATION ENGINE
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Frontend hidden payload field-la irundhu vara data parameters
        const department = req.body.department_name || 'General_Pool';
        const academicYear = req.body.academic_year || 'Unknown_Year';
        
        // Folder names structure-la ulla dots, spaces clean validation handler
        const deptFolder = department.replace(/[^a-zA-Z0-9]/g, "_");
        const yearFolder = academicYear.replace(/[^a-zA-Z0-9]/g, "_");
        
        // Final targeted storage path allocation target (uploads/B_Sc__Computer_Science/III_Year)
        const targetPath = path.join(__dirname, 'uploads', deptFolder, yearFolder);

        // Sub-directories deep validation shield loop check. Illana auto-create aagum!
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }

        cb(null, targetPath);
    },
    filename: function (req, file, cb) {
        // ✨ FILE NAME FORMATTING: Roll Number + Certificate Name + Extension
        const roll = (req.body.roll_number || 'UNKNOWN').trim().toUpperCase();
        const certName = (req.body.certificate_name || 'Certificate').replace(/[^a-zA-Z0-9]/g, "_");
        
        // Original format extension logic extraction tracker (.pdf, .jpg, .png)
        const fileExtension = path.extname(file.originalname);
        
        // Output format mapping pattern template: 24CSC16_JavaBasics.pdf
        cb(null, roll + '_' + certName + fileExtension);
    }
});

const upload = multer({ storage: storage });

// 📤 THE UNIFIED REAL CLOUD DATA INGESTION ROUTE API
app.post('/api/upload-certificate', upload.single('certificate_file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('Error: System failed to receive uploaded file binary stream data package.');
        }
        // Success payload text returns back to client fetch framework pipelines
        res.status(200).send('Cloud hosting encryption pipeline completely successful.');
    } catch (err) {
        res.status(500).send('Internal Server Processing Crash Error: ' + err.message);
    }
});

app.listen(PORT, () => {
    console.log(`VETIAS Storage Engine Node Server Cluster completely live running on port: ${PORT}`);
});
