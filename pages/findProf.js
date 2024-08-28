// // pages/findProf.js
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


// 'use client'
// import { Box, Button, Stack, TextField } from '@mui/material'
// import { useState } from 'react'

// export default function FindProf() {
//     const [messages, setMessages] = useState([
//         {
//           role: 'assistant',
//           content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
//         },
//       ])
//       const [message, setMessage] = useState('')
//       const sendMessage = async () => {
//         setMessage('')
//         setMessages((messages) => [
//           ...messages,
//           {role: 'user', content: message},
//           {role: 'assistant', content: ''},
//         ])
      
//         const response = fetch('/api/chat', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify([...messages, {role: 'user', content: message}]),
//         }).then(async (res) => {
//           const reader = res.body.getReader()
//           const decoder = new TextDecoder()
//           let result = ''
      
//           return reader.read().then(function processText({done, value}) {
//             if (done) {
//               return result
//             }
//             const text = decoder.decode(value || new Uint8Array(), {stream: true})
//             setMessages((messages) => {
//               let lastMessage = messages[messages.length - 1]
//               let otherMessages = messages.slice(0, messages.length - 1)
//               return [
//                 ...otherMessages,
//                 {...lastMessage, content: lastMessage.content + text},
//               ]
//             })
//             return reader.read().then(processText)
//           })
//         })
//       }
//       return (
//         <Box
//           width="100vw"
//           height="100vh"
//           display="flex"
//           flexDirection="column"
//           justifyContent="center"
//           alignItems="center"
//         >
//           <Stack
//             direction={'column'}
//             width="500px"
//             height="700px"
//             border="1px solid black"
//             p={2}
//             spacing={3}
//           >
//             <Stack
//               direction={'column'}
//               spacing={2}
//               flexGrow={1}
//               overflow="auto"
//               maxHeight="100%"
//             >
//               {messages.map((message, index) => (
//                 <Box
//                   key={index}
//                   display="flex"
//                   justifyContent={
//                     message.role === 'assistant' ? 'flex-start' : 'flex-end'
//                   }
//                 >
//                   <Box
//                     bgcolor={
//                       message.role === 'assistant'
//                         ? 'primary.main'
//                         : 'secondary.main'
//                     }
//                     color="white"
//                     borderRadius={16}
//                     p={3}
//                   >
//                     {message.content}
//                   </Box>
//                 </Box>
//               ))}
//             </Stack>
//             <Stack direction={'row'} spacing={2}>
//               <TextField
//                 label="Message"
//                 fullWidth
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//               />
//               <Button variant="contained" onClick={sendMessage}>
//                 Send
//               </Button>
//             </Stack>
//           </Stack>
//         </Box>
//       )
//   }