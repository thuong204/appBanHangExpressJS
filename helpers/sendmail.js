const nodemailer = require("nodemailer");
module.exports.sendMail = (email,subject,html) =>{
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: html,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email: ", error);
        } else {
          console.log("Email sent: ", info.response);
        }
      });

}

/**
 * Giống sendMail nhưng trả về Promise để nơi gọi biết gửi thành công hay thất bại
 * (dùng khi cần báo kết quả cho người dùng, vd. admin phản hồi liên hệ).
 */
module.exports.sendMailAsync = (email, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: html,
    });
}
