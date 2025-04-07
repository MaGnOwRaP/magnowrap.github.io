const express = require('express');
const QRCode = require('qrcode');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
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
        const templateJPG = fs.readFileSync('1.png');


        // Create a new PDF
        const pdfDoc = await PDFDocument.create();
        //pdfDoc.registerFontkit(fontkit):
        const Font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            //(fs.readFileSync('font.tff'));
        
        //Pgae 1
        const page1 = pdfDoc.addPage([2480, 945]); // Use the specified page size (A5-like size)
        

        // Embed the JPG template image
        //const image1 = await pdfDoc.embedJpg(templateJPG);
        const image1 = await pdfDoc.embedPng(templateJPG);
        page1.drawImage(image1, { x: 0, y: 0, width: 2480, height: 945 });
        

        // Convert the QR code Data URL to a PNG byte array
        //const qrImageBytes = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
        //const qrImage = await pdfDoc.embedpng(qrImageBytes);

        // Embed the QR code image in the desired position (x: 1237, y: 146)
        //page1.drawImage(qrImage, { x: 2300, y: 530, width: 400, height: 400 });


        // Add text for the ticket code
        // Determine the price based on ticket ID prefix
        let priceText = 'LKR ???';
        if (userCode.startsWith('UG')) {
             priceText = 'LKR 2800/=';
            } 
        else if (userCode.startsWith('AL')) {
            priceText = 'LKR 4000/=';
        }

        // Add the price to page 1
        page1.drawText(priceText, {
             x: 1805,
             y: 80,
            size: 80,
            font: Font,
            color: rgb(0, 0, 0),
        });
        page1.drawText('LKR 2800/=', {
            x: 1805,
            y: 80,
            size: 80,
            font: Font,
            color: rgb(0,0,0),
        })
        console.log(`Ticket Code: ${userCode}, Price: ${priceText}`);

    

    //Pgae 1
        const page2 = pdfDoc.addPage([2480, 945]); // Use the specified page size (A5-like size)
        

        // Embed the JPG template image
        const img = await pdfDoc.embedPng(fs.readFileSync('2.png'));
        page2.drawImage(img, { x: 0, y: 0, width: 2480, height: 945 });
        

        // Convert the QR code Data URL to a PNG byte array
        const qrImageBytes = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
        const qrImage = await pdfDoc.embedPng(qrImageBytes);

        // Embed the QR code image in the desired position (x: 1237, y: 146)
        page2.drawImage(qrImage, { x: 1777, y: 350, width: 400, height: 400 });


        // Add text for the ticket code
        //page2.drawText('Bla Bla', {
          //  x:50,
          //  y: 4,
          //  size: 60,
          //  font: timesRomanFont,
          //  color: rgb(0,0.53,0.17),
        //})


        // Save the PDF and send to frontend
        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Amizade25 Ticket.pdf"');
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
