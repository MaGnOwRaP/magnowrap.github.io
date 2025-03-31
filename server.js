const express = require('express');
const QRCode = require('qrcode');
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const cors = require('cors');
const Jimp = require('jimp'); // No conversion required from PNG to JPG

const app = express();
const PORT = 3000;

app.use(cors());

// Route to generate the PDF with a QR code
app.get('/generate-pdf', async (req, res) => {
    try {
        const userCode = req.query.code;
        if (!userCode) {
            return res.status(400).send('Missing code parameter');
        }

        // Generate QR code as a Data URL
        const qrCodeDataURL = await QRCode.toDataURL(userCode);

        // Read the JPG template directly (no conversion)
        const templateJPG = fs.readFileSync('template.jpg');

        // Create a new PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([3000, 1000]); // Use the specified page size (A5-like size)

        // Embed the JPG template image
        const image = await pdfDoc.embedJpg(templateJPG);
        page.drawImage(image, { x: 0, y: 0, width: 3000, height: 1000 });

        // Convert the QR code Data URL to a PNG byte array
        const qrImageBytes = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
        const qrImage = await pdfDoc.embedPng(qrImageBytes);

        // Embed the QR code image in the desired position (x: 1237, y: 146)
        page.drawImage(qrImage, { x: 2300, y: 530, width: 400, height: 400 });

        // Add text for the ticket code
       
        // Save the PDF and send to frontend
        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="ticket.pdf"');
        res.send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
