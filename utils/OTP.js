import nodemailer from'nodemailer'

const sendOTP = async (email, otp)=>{
    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth:{
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const mailOptions = {
        from: process.env.EMAIL_USER, 
        to: email, 
        subject:"Your Umurava OTP", 
        text: `Your OTP is: ${otp}. It will expire in 5 minutes. ` 
    }

    await transporter.sendMail(mailOptions)
}

export default sendOTP