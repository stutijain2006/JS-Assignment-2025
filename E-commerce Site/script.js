const API_BASE = 'http://localhost:4000';
async function fetchJSON(path) {
    const response = await fetch(`${API_BASE}${path}`);
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.json();
}

async function init() {
    try {
        const categories = await fetchJSON('/categories');
        const categoryList = document.getElementById('category');

        document.getElementById('all').addEventListener('click', (e) => {
            document.querySelectorAll('nav button, #all').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            fetchAllItems();
        });

        categories.forEach(category => {
            const button = document.createElement('button');
            button.textContent = category.category;
            button.addEventListener('click', (e) => {
                document.querySelectorAll('nav button, #all').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                fetchItemsByCategory(category.category);
            }); 
            categoryList.appendChild(button);
        });
        
        document.getElementById('all').classList.add('active');
        await fetchAllItems();
    } catch (error) {
        console.error(error);
    }
};

async function fetchAllItems() {
    try {
        const items = await fetchJSON('/items');
        renderItems(items); 
        renderTags(items);
    } catch (error) {
        console.error(error);
    }
};

async function fetchItemsByCategory(category) {
    try {
        const items = await fetchJSON(`/categories/${category}/items`);
        renderItems(items);
        renderTags(items, category);
    } catch (error) {
        console.error(error);
    }
};

function renderItems(items) {
    const itemContainer = document.getElementById('items');
    itemContainer.innerHTML = '';

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('item');
        itemElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p>Price: $${item.price ? parseFloat(item.price).toFixed(2) : 'N/A'}</p>
        `;
        itemContainer.appendChild(itemElement);
    });
};

function renderTags(items) {
    const tagContainer = document.getElementById('tags');
    tagContainer.innerHTML = '';

    const uniqueTags = new Set();
    items.forEach(item => {
        if (item.tags) {
            item.tags.split('|').forEach(tag => {
                uniqueTags.add(tag.trim());
            })
        }
    })

    uniqueTags.forEach(tag => {
        const button = document.createElement('button');
        button.textContent = tag;
        button.addEventListener('click', () => {
            Array.from(tagContainer.children).forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderItems(items.filter(item => item.tags && item.tags.includes(tag)));
        }); 
        tagContainer.appendChild(button);
    });
}

init();


