
let allPetsData = [];
let likedPets = [];
let adoptedIds = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadAllPets();
    setupMobileMenu();
});

// 1. Fetch Categories
const loadCategories = async () => {
    try {
        const res = await fetch('https://openapi.programming-hero.com/api/peddy/categories');
        const data = await res.json();
        displayCategories(data.categories);
    } catch (err) {
        console.error("Failed to fetch categories", err);
    }
};

const displayCategories = (categories) => {
    const container = document.getElementById('category-container');
    container.innerHTML = "";
    categories.forEach(item => {
        const btn = document.createElement('button');
        btn.id = `btn-${item.category}`;
        btn.className = "category-btn flex items-center gap-3 px-8 py-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 text-slate-600 font-bold transition-all";
        btn.innerHTML = `
            <img src="${item.category_icon}" class="w-6 h-6 object-contain">
            ${item.category}
        `;
        btn.onclick = () => handleCategoryClick(item.category);
        container.append(btn);
    });
};

// 2. Fetch and Display Pets
const loadAllPets = async (category = null) => {
    const container = document.getElementById('pets-container');
    const spinner = document.getElementById('loading-spinner');
    const emptyState = document.getElementById('empty-state');
    
    if (!container || !spinner || !emptyState) return;

    // Highlight active category
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('bg-teal-50', 'text-teal-700', 'border-teal-200', 'shadow-sm');
        btn.classList.add('bg-white', 'border-slate-100', 'text-slate-600');
    });
    
    if(category) {
        const activeBtn = document.getElementById(`btn-${category}`);
        if(activeBtn) {
            activeBtn.classList.remove('bg-white', 'border-slate-100', 'text-slate-600');
            activeBtn.classList.add('bg-teal-50', 'text-teal-700', 'border-teal-200', 'shadow-sm');
        }
    }

    container.innerHTML = ""; 
    emptyState.classList.add('hidden');
    spinner.classList.remove('hidden');

    const url = category 
        ? `https://openapi.programming-hero.com/api/peddy/category/${category.toLowerCase()}`
        : `https://openapi.programming-hero.com/api/peddy/pets`;

    const start = Date.now();
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        allPetsData = category ? (data.data || []) : (data.pets || []);
        
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 2000 - elapsed);

        setTimeout(() => {
            spinner.classList.add('hidden');
            if(!allPetsData || allPetsData.length === 0) {
                emptyState.classList.remove('hidden');
            } else {
                displayPets(allPetsData);
            }
        }, remaining);
    } catch (err) {
        console.error("Failed to fetch pets", err);
        spinner.classList.add('hidden');
        emptyState.classList.remove('hidden');
    }
};

const displayPets = (pets) => {
    const container = document.getElementById('pets-container');
    container.innerHTML = "";

    pets.forEach(pet => {
        const isAdopted = adoptedIds.includes(pet.petId);
        const card = document.createElement('div');
        card.className = "bg-white border border-slate-200 rounded-[2rem] p-4 flex flex-col group hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500";
        card.innerHTML = `
            <div class="h-48 bg-slate-100 rounded-[1.5rem] mb-4 overflow-hidden relative">
                <img src="${pet.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                <button onclick="handleLike('${pet.image}')" class="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm">
                    <i class="fa-solid fa-heart"></i>
                </button>
            </div>
            <div class="px-1 flex-1 flex flex-col">
                <h3 class="font-black text-xl text-slate-900 mb-3">${pet.pet_name || 'Unnamed Pet'}</h3>
                <div class="text-sm text-slate-500 space-y-2 mb-6">
                    <p>🧬 <span class="font-medium">Breed:</span> ${pet.breed || 'N/A'}</p>
                    <p>📅 <span class="font-medium">Birth:</span> ${pet.date_of_birth || 'N/A'}</p>
                    <p>⚤ <span class="font-medium">Gender:</span> ${pet.gender || 'N/A'}</p>
                    <p class="font-bold text-slate-900 border-t border-slate-50 pt-2 mt-2">💰 Price: ${pet.price ? pet.price + '$' : 'Negotiable'}</p>
                </div>
                <div class="mt-auto grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                    <button id="adopt-btn-${pet.petId}" onclick="startAdoption(${pet.petId})" 
                        class="py-2.5 rounded-xl text-xs font-bold transition-all ${isAdopted ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'}"
                        ${isAdopted ? 'disabled' : ''}>
                        ${isAdopted ? 'Adopted' : 'Adopt'}
                    </button>
                    <button onclick="showDetails(${pet.petId})" class="py-2.5 bg-white border border-teal-600 text-teal-600 rounded-xl text-xs font-bold hover:bg-teal-50 transition-all">
                        Details
                    </button>
                </div>
            </div>
        `;
        container.append(card);
    });
};

// 3. Handlers
const handleCategoryClick = (category) => {
    loadAllPets(category);
};

const handleSort = () => {
    const sorted = [...allPetsData].sort((a, b) => (b.price || 0) - (a.price || 0));
    displayPets(sorted);
};

const handleLike = (imgUrl) => {
    if(!likedPets.includes(imgUrl)) {
        likedPets.push(imgUrl);
        const grid = document.getElementById('liked-pets-grid');
        const emptyMsg = grid.querySelector('.empty-msg');
        if(emptyMsg) emptyMsg.remove();
        
        const div = document.createElement('div');
        div.className = "aspect-square bg-slate-100 rounded-xl border border-white shadow-sm overflow-hidden animate-in fade-in zoom-in duration-300";
        div.innerHTML = `<img src="${imgUrl}" class="w-full h-full object-cover">`;
        grid.appendChild(div);
        
        document.getElementById('liked-count').innerText = likedPets.length;
    }
};

const showDetails = async (id) => {
    const res = await fetch(`https://openapi.programming-hero.com/api/peddy/pet/${id}`);
    const data = await res.json();
    const pet = data.petData;

    const modal = document.getElementById('details_modal');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `
        <div class="rounded-3xl overflow-hidden mb-8 shadow-sm h-64 md:h-80 border border-slate-50">
            <img src="${pet.image}" class="w-full h-full object-cover">
        </div>
        <h2 class="text-3xl font-black text-slate-900 mb-6">${pet.pet_name}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-10 text-slate-500 text-sm">
            <p>🧬 <span class="font-bold text-slate-900">Breed:</span> ${pet.breed || 'N/A'}</p>
            <p>📅 <span class="font-bold text-slate-900">Birth:</span> ${pet.date_of_birth || 'N/A'}</p>
            <p>⚤ <span class="font-bold text-slate-900">Gender:</span> ${pet.gender || 'N/A'}</p>
            <p>🏥 <span class="font-bold text-slate-900">Vaccinated:</span> ${pet.vaccinated_status || 'Unknown'}</p>
            <p class="col-span-full font-bold text-teal-800 text-base py-3 px-4 bg-teal-50 rounded-xl">💰 Price: ${pet.price || 'N/A'}$</p>
        </div>
        <div class="pt-8 border-t border-slate-100">
            <h4 class="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Detailed Description</h4>
            <p class="text-slate-500 leading-relaxed">${pet.pet_details}</p>
        </div>
    `;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

const closeDetails = () => {
    const modal = document.getElementById('details_modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
};

const startAdoption = (id) => {
    const modal = document.getElementById('adopt_modal');
    const countdownEl = document.getElementById('countdown-number');
    const btn = document.getElementById(`adopt-btn-${id}`);
    
    let count = 3;
    countdownEl.innerText = count;
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const interval = setInterval(() => {
        count--;
        countdownEl.innerText = count;
        if (count === 0) {
            clearInterval(interval);
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                adoptedIds.push(id);
                btn.innerText = "Adopted";
                btn.disabled = true;
                btn.className = "py-2.5 rounded-xl text-xs font-bold transition-all bg-slate-100 text-slate-400 cursor-not-allowed";
            }, 500);
        }
    }, 1000);
};

const setupMobileMenu = () => {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    menuBtn.onclick = () => {
        menu.classList.toggle('hidden');
    };
};

const scrollToAdopt = () => {
    document.getElementById('adopt-section').scrollIntoView({ behavior: 'smooth' });
};
