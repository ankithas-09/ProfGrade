import { useState, useRef, useEffect } from 'react';
import styles from '../styles/Home.module.css'; // Import the CSS module

export default function FindProf() {
  const [chatInput, setChatInput] = useState('');
  const [formInput, setFormInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi! I’m ProfessorPal, here to provide you with all the information you need about professors. How can I assist you today?", isComplete: true }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState('');
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const messageList = document.querySelector(`.${styles.messageList}`);
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  }, [messages]);

  
  const handleChatSend = async () => {
    if (!chatInput.trim() || isTyping) return;
  
    const userMessage = { sender: 'user', text: chatInput };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setChatInput('');
    setIsTyping(true);
  
    try {
      const conversation = [...messages, userMessage].map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'bot',
        content: msg.text
      }));
  
      console.log('Conversation:', conversation); // Log conversation
  
      const response = await fetch('/api/chat/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: chatInput }), // Send chatInput as query
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log('Response:', result); // Log response
  
        // Parse the response text for better readability
        const formattedText = result.text
          .split("\n\n-------\n\n")  // Split multiple contexts
          .map(context => context.split("\n"))  // Split lines in each context
          .map(lines => ({
            rating: lines.find(line => line.startsWith("Rating:")) || "Rating: N/A",
            subject: lines.find(line => line.startsWith("Subject:")) || "Subject: N/A",
            review: lines.find(line => line.startsWith("Review:")) || "Review: N/A"
          }))
          .map(({ rating, subject, review }) => `${rating}\n${subject}\n${review}`)
          .join("\n\n-------\n\n");
  
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: formattedText },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: 'Error: Unable to fetch response' },
        ]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: 'Failed to send message.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setScrapeMessage('Processing data....');
  
    try {
      const res = await fetch('/api/chat/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: formInput }),
      });
  
      const data = await res.json();
      if (res.ok) {
        setScrapeMessage(data.message);
      } else {
        setScrapeMessage(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error:', error);
      setScrapeMessage('Failed to process data');
    }
  
    setFormInput(''); // Clear the input after submission
  };

  return (
    <div className={styles.findProfContainer}>
      <div className={styles.findProf}>
        <h1 className={styles.title}>Find me Professor</h1>
        <form className={styles.form} onSubmit={handleFormSubmit}>
          <input
            type="text"
            value={formInput}
            onChange={(e) => setFormInput(e.target.value)}
            placeholder="Enter Rate My Professor URL"
            required
            className={styles.input}
          />
          <button
            type="submit"
            className={styles.submitButton}
          >
            Submit
          </button>
        </form>
        {scrapeMessage && <p className={styles.findProfMessage}>{scrapeMessage}</p>}
      </div>
      <div className={styles.chatbotContainer}>
        <div className={styles.messageStack}>
          <div className={styles.messageList}>
            {messages.map((message, index) => (
              <div key={index} className={`${styles.message} ${styles[message.sender]}`}>
                <div className={`${styles.messageContent} ${message.sender === 'user' ? styles.client : styles.assistant}`}>
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.inputRow}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' ? handleChatSend() : null}
            className={styles.chatInput}
          />
          <button onClick={handleChatSend} className={styles.button}>Send</button>
        </div>
      </div>
    </div>
  );
}
