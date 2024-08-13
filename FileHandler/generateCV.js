const PDFDocument = require('pdfkit');
const fs = require('fs');

async function generateCV(user, address, education, filePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(filePath))
      .on('finish', resolve) 
      .on('error', reject);   

   
    doc.fontSize(30).font('Times-Roman').text(`${user.Fullname}`, {
      align: 'center'
    });
    doc.fontSize(25).font('Times-Roman').text(`${user.freelancerprofile.title}`, {
      align: 'center'
    });

  

    doc.fontSize(12).font('Times-Roman').text(`Email: ${user.Email}`);
    doc.text(`Phone: ${user.Phonenumber}`);
    doc.text(`Address: ${address}`);
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown();
    if (user.freelancerprofile && user.freelancerprofile.title) {
      doc.fontSize(14).font('Times-Roman').text('Professional Summary', { underline: true });
      if (user.freelancerprofile.description) {
        doc.fontSize(12).font('Times-Roman').text(user.freelancerprofile.description);
      }
      doc.moveDown();
      
  
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    }

    doc.moveDown();
    if (user.freelancerprofile && user.freelancerprofile.skills && user.freelancerprofile.skills.length > 0) {
      doc.fontSize(14).font('Times-Roman').text('Skills', { underline: true });
      user.freelancerprofile.skills.forEach(skill => {
        doc.fontSize(12).font('Times-Roman').text(`- ${skill}`);
      });
      doc.moveDown();


      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    }

    doc.moveDown();
    if (education && education.length > 0) {
      doc.fontSize(14).font('Times-Roman').text('Education', { underline: true });
      education.forEach((educationString) => {
        const educationDetails = educationString.split(',');
        
        if (educationDetails.length > 0) {
          doc.fontSize(12).font('Times-Roman').text(`Institution: ${educationDetails[0]}`);
          doc.moveDown();
        }

        if (educationDetails.length > 1) {
          doc.text(`Degree: ${educationDetails[1]}`);
          doc.moveDown();
        }

        if (educationDetails.length > 2) {
          doc.text(`Description: ${educationDetails.slice(2).join(', ')}`);
          doc.moveDown();
        }
      });


      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    }
    doc.moveDown();

    if (user.freelancerprofile && user.freelancerprofile.workhistory && user.freelancerprofile.workhistory.length > 0) {
      doc.fontSize(14).font('Times-Roman').text('Work History', { underline: true });
      user.freelancerprofile.workhistory.forEach(job => {
        doc.fontSize(12).font('Times-Roman').text(`- ${job}`);
      });
      doc.moveDown();


      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    }

    doc.end();
  });
}

module.exports = generateCV;
