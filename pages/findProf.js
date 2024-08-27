// pages/findProf.js
import { useState } from 'react';
import styles from '../styles/Home.module.css'; // Import the CSS module

export default function FindProf() {
    const [url, setUrl] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Scraping data...');

        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(data.message);
            } else {
                setMessage(data.message || 'Something went wrong');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Failed to scrape data');
        }
    };

    return (
        <div className={styles.findProfContainer}>
            <h1>Find me Professor</h1>
            <form className={styles.findProfForm} onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter Rate My Professor URL"
                    required
                />
                <button type="submit">Submit</button>
            </form>
            {message && <p className={styles.findProfMessage}>{message}</p>}
        </div>
    );
}
