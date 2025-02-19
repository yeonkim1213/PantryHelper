import React, { createContext, useContext, useref } from 'react';
import emailjs from 'emailjs-com';
import dayjs from 'dayjs';

const EmailContext = createContext();

export const EmailProvider = ({ children }) => {

  const serviceId = 'pantryhelper'
  const templateId1 = 'phtemplate_default'
  const templateId2 = 'phtemplate_EventDelete'
  const publicKey = 'Z_Zi5Nw-k5OlSAO-j'

  const sendContactEmail = ({ subject, body, pantryEmail, senderEmail}) => {
    if (!senderEmail || !pantryEmail) {
      alert('sender/pantry email error');
      return;
    }
    if (pantryEmail == "N/A"){
      alert('No pantry email avaliable');
      return;
    }

    let emailbody = body + "\n\nEmail sent through Pantry Helper. For sender Email, check 'Reply To'.";

    let email_to = "pantryhelper2024@gmail.com" 

    const templateParams = {
      subject: subject,
      body: emailbody,
      to_email: email_to,
      reply_to: senderEmail
    };

    emailjs.send(
      serviceId,
      templateId1,
      templateParams,
      publicKey
    ).then((response) => {
      console.log('SUCCESS!', response.status, response.text);
    }).catch((err) => {
      console.error('FAILED...', err);
      alert('Failed to send email.');
    });

  };

  const sendEventEmail = ({ title, date, location, description, emails, pantryName }) => {
    if (!emails || emails.length === 0) {
      alert('No subscribed emails found. Unable to send the event notification.');
      return;
    }

    const email_to = emails.join(', ');
    const formattedDate = dayjs(date).format('MMMM D, YYYY');

    const subject = `New Event: ${title}`;
    const body = `Dear Valued Member,

We are excited to announce a new event!

Here are the details:

Event Name: ${title}
Date: ${formattedDate}
Location: ${location}
Event Details: ${description}

We look forward to seeing you at the event!

Warm regards,
Pantry Helper`;

    const templateParams = {
      subject,
      body,
      to_email: email_to
    };

    emailjs.send(serviceId, templateId1, templateParams, publicKey)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
      })
      .catch((err) => {
        console.error('FAILED...', err);
        alert('Failed to send email.');
      });
  };

  const sendEventCancelEmail = ({ title, date, location, emails }) => {

    if (!emails || emails.length === 0) {
      alert('No subscribed emails found. Unable to send the event notification.');
      return;
    }

    const email_to = emails.join(', ');
    const formattedDate = dayjs(date).format('MMMM D, YYYY');

    const subject = `Event Cancelled: ${title}`;
    const body = `Dear Valued Member, 

    We regret to inform you that the event "${title}" scheduled for ${formattedDate} at ${location} has been cancelled due to unforeseen circumstances.

We apologize for any inconvenience this may cause and appreciate your understanding. Please feel free to reach out to us if you have any questions or need further information.

Thank you for your continued support. We look forward to seeing you at our future events.

Warm regards,
Pantry Helper`;

    const templateParams = {
      subject,
      body,
      to_email: email_to
    };

    emailjs.send(serviceId, templateId1, templateParams, publicKey)
    .then((response) => {
      console.log('SUCCESS!', response.status, response.text);
    })
    .catch((err) => {
      console.error('FAILED...', err);
      alert('Failed to send email.');
    });
  };

  //   try {
  //     const response = await emailjs.send(
  //       serviceId,
  //       templateId1, // Using the default template for now
  //       templateParams,
  //       publicKey
  //     );
  //     console.log('Cancellation email sent successfully');
  //     return response;
  //   } catch (error) {
  //     console.error('Failed to send cancellation email:', error);
  //     throw error;
  //   }
  // };

  return (
    <EmailContext.Provider value={{ sendContactEmail, sendEventEmail, sendEventCancelEmail }}>
      {children}
    </EmailContext.Provider>
  );
};

export const useEmail = () => useContext(EmailContext);