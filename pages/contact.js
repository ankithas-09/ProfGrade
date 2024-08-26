// src/pages/contact.js
import { useState } from 'react';
import styles from '../styles/Home.module.css'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; 


const ContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!name || !email || !message) {
      setStatus('Please fill in all fields.');
      return;
    }
  
    try {
      // Reference to the contacts collection
      const contactsRef = collection(db, 'contacts');
      
      // Add a new document to the contacts collection
      await addDoc(contactsRef, {
        name,
        email,
        message,
        timestamp: serverTimestamp()
      });
  
      setName('');
      setEmail('');
      setMessage('');
      setStatus('Message sent successfully!');
    } catch (error) {
      console.error("Error sending message:", error); // Log the error details
      setStatus('Error sending message. Please try again.');
    }
  };

  return (
    <div className={styles.contactContainer}>
      <form className={styles.contactForm} onSubmit={handleSubmit}>
        <h1>Contact Us</h1>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
        {status && <p>{status}</p>}
      </form>
    </div>
  );
};

export default ContactForm;
