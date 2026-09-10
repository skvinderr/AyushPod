const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const keyMatch = env.match(/SARVAM_API_KEY=[\"']?([^\"'\r\n]+)[\"']?/);
if (!keyMatch) { 
  console.log('No key found in .env.local'); 
  process.exit(1); 
}
const key = keyMatch[1].trim();

fetch('https://api.sarvam.ai/text-to-speech', {
  method: 'POST',
  headers: {
    'api-subscription-key': key,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    inputs: ['Hello world'],
    target_language_code: 'en-IN',
    model: 'bulbul:v3',
    speaker: 'manisha',
    pace: 0.95
  })
}).then(async res => {
  console.log('Status (with wrong payload):', res.status);
  const text = await res.text();
  if (!res.ok) console.log('Error Body:', text.slice(0, 500));
}).catch(console.error);

fetch('https://api.sarvam.ai/text-to-speech', {
  method: 'POST',
  headers: {
    'api-subscription-key': key,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Hello world',
    language_code: 'en-IN',
    model: 'bulbul:v3',
    speaker: 'manisha',
    pace: 0.95
  })
}).then(async res => {
  console.log('Status (with correct payload):', res.status);
  const text = await res.text();
  if (!res.ok) console.log('Error Body:', text.slice(0, 500));
  else console.log('Success!', text.slice(0, 100));
}).catch(console.error);
