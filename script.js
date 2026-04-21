// Твої налаштування
const GITHUB_USER = 'lomon23'; 
const REPO_NAME = 'labsss';
const FOLDER = 'days';

async function loadDays() {
    const container = document.getElementById('days-container');
    if (!container) return; // Якщо контейнера немає на цій сторінці - нічого не робимо

    try {
        // 1. Стукаємо в API за списком файлів у папці days
        const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/${FOLDER}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) throw new Error('Не вдалося отримати список файлів');
        const files = await response.json();

        // 2. Відбираємо тільки .md файли
        const mdFiles = files.filter(file => file.name.endsWith('.md'));

        // Очищаємо контейнер від напису "Завантаження..."
        container.innerHTML = '';

        // 3. Проходимося по кожному файлу і витягуємо контент
        for (let file of mdFiles) {
            // download_url - це пряме посилання на сирий текст файлу
            const textResponse = await fetch(file.download_url);
            const mdText = await textResponse.text();

            // 4. Парсимо Markdown у HTML
            const htmlContent = marked.parse(mdText);

            // 5. Створюємо блок для поста і кидаємо на сторінку
            const article = document.createElement('article');
            article.className = 'day-post'; // Клас для твого style.css
            
            // Робимо заголовок з назви файлу (прибираємо .md)
            const dateTitle = file.name.replace('.md', ''); 
            
            article.innerHTML = `
                <h3 class="post-date">[${dateTitle}]</h3>
                <div class="post-content">${htmlContent}</div>
                <hr style="border-color: #333;">
            `;
            
            container.appendChild(article);
        }

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Помилка: не вдалося завантажити дні. Перевір чи закинув ти код на GitHub.</p>';
    }
}

// Запускаємо
loadDays();