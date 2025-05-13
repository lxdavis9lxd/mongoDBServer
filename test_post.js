// test_post.js
const fetch = require('node-fetch');

async function testPost() {
  const apiUrl = 'https://glowing-meme-4j9w9wjpq9ghg4j-5001.app.github.dev/items';
  
  console.log(`Testing POST request to: ${apiUrl}`);
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Item via Script',
        quantity: 15
      }),
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPost();
