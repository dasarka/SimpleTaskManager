const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.MAIL_KEY);

const sendWelcomeEmail = (email,name) =>{
    sgMail.send({
        to: email,
        from: process.env.SENDER_MAIL,
        subject: 'Thanks for joining in!',
        text: `Welcome to the Task Manager App,${name}, let me know how you get along with the app`
      });
}

const sendCancellationEmail = (email,name) =>{
    sgMail.send({
        to: email,
        from:  process.env.SENDER_MAIL,
        subject: 'Sorry to see you go!',
        text: `GoodBye,${name}, I hope to see you back sometime soon`
      });
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}