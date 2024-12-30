import fetch from 'node-fetch';

async function generateBook() {
    const response = await fetch('http://localhost:8888/.netlify/functions/api/books/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: "Uma história sobre um homem que trabalha em um escritório chato"
        })
    });

    const book = await response.json();
    console.log('Prompt Original:', book.original_prompt);
    console.log('\nPrompt Aprimorado:', book.enhanced_prompt);
    console.log('\nOutline:', book.outline);
    console.log('\nConteúdo:', book.content);
    console.log('\nReview:', book.review);
}

generateBook().catch(console.error);
