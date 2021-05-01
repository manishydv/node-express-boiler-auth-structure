
const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  port: 465,
  auth: {
      user: process.env.NODEMAILER_USERID,
      pass: process.env.NODEMAILER_PWD
  },
   tls: {
      rejectUnauthorized: false
  }
});


module.exports = {
    sendSignupMail: function(email, fullName) {
        var mailBodyTemplate = `
             <table border="0">
               <tbody>
                 <tr>
                   <td><p>Howdy ${fullName} ! ✌️</p></td>
                 </tr>
                 <tr>
                  <td>
                    <p>Welcome to <b>Landingi builder!</b></p>
                  </th>
                </tr>
                <tr>
                  <td>
                  <p>Love & Respect<br>builder</p>
                  </td>
                </tr>
                </tbody>
             </table>`;
      var mailOptions = {
        to: email,
        from: process.env.NODEMAILER_USERID,
        subject: 'Welcome to landingi builder.',
        html: mailBodyTemplate
        };

      transporter.sendMail(mailOptions, (err, info) => {
        console.log("==mail---sendSignupMail===");
        if (err)console.log("----err----",err);
          console.log("-----info--- ",info);
      });

    },
    sendResetPasswordLink: function(email, linkid) {
      var mailBodyTemplate = `
             <table border="0">
               <tbody>
                 <tr>
                   <td><p>Hi ${email} ,You are receiving this because you (or someone else) have requested the reset of the password for your account.! ✌️</p></td>
                 </tr>
                 <tr>
                  <td>
                    <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                    <p><a href="${process.env.HOST}/resetPassword?id=${linkid}">${process.env.HOST}/resetPassword?id=${linkid}</a></p>
                    <br>
                    <p style="margin-left:10px"> or </p>
                    <p><a href="${process.env.HOST}/resetPassword?id=${linkid}">Click here</a></p>
                    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
                    </th>
                </tr>
                <tr>
                  <td>
                  <p>Love & Respect<br>builder</p>
                  </td>
                </tr>
                </tbody>
             </table>`;
        var mailOptions = {
          to: email,
          from: process.env.NODEMAILER_USERID,
          subject: 'Reset Password Link',
          html: mailBodyTemplate
          };

        transporter.sendMail(mailOptions, (err, info) => {
          console.log("==mail---sendResetPasswordLink===");
          if (err)console.log("----err----",err);
            console.log("-----info--- ",info);
        });
    },
};