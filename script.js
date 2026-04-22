const GITHUB_USER = 'lomon23'; 
const REPO_NAME = 'labsss';
const FOLDER = 'days';

async function loadDays() {
    const container = document.getElementById('days-container');
    if (!container) return; 

    // Визначаємо, чи ми на локалхості
    const isLocal = window.location.hostname === '' || window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';

    try {
        let mdFiles = [];

        if (isLocal) {
            // === ЛОКАЛЬНИЙ ХАК (Парсимо HTML від Live Server) ===
            // Робимо запит до самої папки
            const response = await fetch('../days/');
            if (!response.ok) throw new Error('Не можу прочитати локальну папку');
            
            // Отримуємо сирий HTML, який згенерував Live Server
            const htmlText = await response.text();
            
            // Створюємо віртуальний DOM, щоб витягнути лінки
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const links = Array.from(doc.querySelectorAll('a'));
            
            // Фільтруємо тільки .md файли
            mdFiles = links
                .map(a => a.getAttribute('href'))
                .filter(href => href && href.endsWith('.md'))
                .map(name => ({
                    name: name,
                    download_url: `../days/${name}` // Формуємо шлях для скачування
                }));

        } else {
            // === РЕЖИМ GITHUB (Працює як і раніше через API) ===
            const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/${FOLDER}`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Помилка API');
            const files = await response.json();
            mdFiles = files.filter(file => file.name.endsWith('.md'));
        }

        // === СОРТУВАННЯ (НОВІ ЗВЕРХУ) ===
        // Працюватиме тільки якщо файли названі строго ДД_ММ_РРРР.md
        mdFiles.sort((a, b) => {
            let partsA = a.name.replace('.md', '').split('_');
            let partsB = b.name.replace('.md', '').split('_');
            let dateA = new Date(partsA[2], partsA[1] - 1, partsA[0]);
            let dateB = new Date(partsB[2], partsB[1] - 1, partsB[0]);
            return dateB - dateA; 
        });

        container.innerHTML = '';

        // Рендеримо пости
        for (let file of mdFiles) {
            const textResponse = await fetch(file.download_url);
            if (!textResponse.ok) continue; 
            
            const mdText = await textResponse.text();
            const htmlContent = marked.parse(mdText);

            const article = document.createElement('article');
            const dateTitle = file.name.replace('.md', ''); 
            
            article.innerHTML = `
                <div class="post-header">~/${dateTitle}</div>
                <div class="post-content">${htmlContent}</div>
                <hr class="day-separator">
            `;
            
            container.appendChild(article);
        }

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Помилка завантаження постів.</p>';
    }
}

loadDays();