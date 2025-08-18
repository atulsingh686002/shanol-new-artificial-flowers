// ===== Products & Cart =====
const productList = document.getElementById("product-list");
const cartDiv = document.getElementById("cart");
const cartCount = document.getElementById("cart-count");

// Render Products
function renderProducts(list){
    if (!productList) return;
    productList.innerHTML = "";
    list.forEach(p=>{
        const card = document.createElement("div");
        card.className="border p-4 rounded shadow relative flex flex-col items-center";

        const img1 = document.createElement("img");
        img1.src = p.images[0];
        img1.className="w-full h-48 object-cover rounded mb-2 transition-opacity duration-500";

        const img2 = document.createElement("img");
        img2.src = p.images[1] || p.images[0];
        img2.className="w-full h-48 object-cover rounded absolute top-0 left-0 opacity-0 transition-opacity duration-500";

        card.addEventListener("mouseenter", ()=>{ img1.style.opacity=0; img2.style.opacity=1; });
        card.addEventListener("mouseleave", ()=>{ img1.style.opacity=1; img2.style.opacity=0; });

        const title = document.createElement("h3");
        title.textContent = p.title;
        title.className="font-medium text-center mt-2";

        const price = document.createElement("p");
        price.textContent = "₹"+p.price;
        price.className="text-green-700 font-bold";

        const btnDiv = document.createElement("div");
        btnDiv.className="flex gap-2 mt-2 flex-wrap justify-center";

        const addBtn = document.createElement("button");
        addBtn.textContent="Add to Cart";
        addBtn.className="bg-indigo-600 text-white px-3 py-1 rounded";
        addBtn.onclick = ()=> addToCart(p.id);

        const viewBtn = document.createElement("button");
        viewBtn.textContent="View";
        viewBtn.className="bg-gray-600 text-white px-3 py-1 rounded";
        viewBtn.onclick = ()=> viewProduct(p.id);

        btnDiv.appendChild(addBtn);
        btnDiv.appendChild(viewBtn);

        card.appendChild(img1);
        card.appendChild(img2);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(btnDiv);

        productList.appendChild(card);
    });
}

// ===== Cart Functions =====
function addToCart(id){
    const allProducts = JSON.parse(localStorage.getItem("allProducts")) || [];
    const product = allProducts.find(p => String(p.id) === String(id));

    if(!product){
        console.error("Product not found:", id);
        showToast("Product not found");
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const exists = cart.find(p => String(p.id) === String(id));

    if(!exists){
        cart.push({
            id: product.id,
            title: product.title,
            price: Number(product.price) || 0,
            images: product.images && product.images.length ? product.images : [""],
            quantity: 1,
            sku: product.sku || product.SKU || ("SKU-"+product.id) 
        });
    } else {
        exists.quantity += 1;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCart();
    showToast(`${product.title} added to cart!`);
}

function updateCartCount(){
    const cart = JSON.parse(localStorage.getItem("cart"))||[];
    const count = cart.reduce((sum,i)=>sum+i.quantity,0);
    if(cartCount) cartCount.textContent = count;

    // mobile cart count bhi update ho
    const cartCountMobile = document.getElementById("cart-count-mobile");
    if(cartCountMobile) cartCountMobile.textContent = count;
}

function renderCart(){
    if(!cartDiv) return;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if(cart.length === 0){
        cartDiv.innerHTML = `
            <h2 class="text-2xl font-bold mb-4">Your Cart</h2>
            <p>Cart is empty.</p>
        `;
        return;
    }

    let total = 0;
    let html = `
        <h2 class="text-2xl font-bold mb-4">Your Cart</h2>
        <ul>
    `;
    
    cart.forEach(item=>{
        const price = Number(item.price) || 0;
        const subTotal = price * item.quantity;
        total += subTotal;

        html += `
        <li class="mb-2 border-b py-2 flex justify-between items-center">
            <div class="flex items-center gap-4">
                <img src="${(item.images && item.images[0]) ? item.images[0] : 'https://via.placeholder.com/60'}" 
                     class="w-16 h-16 object-cover rounded" alt="${item.title}">
                <div>
                    <p class="font-semibold">${item.title || "No Title"}</p>
                    <p class="text-sm text-gray-500">SKU: ${item.sku || "N/A"}</p>
                    <p>₹${price} × ${item.quantity} = <b>₹${subTotal}</b></p>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="decreaseQty(${item.id})" class="bg-yellow-500 text-white px-2 rounded">-</button>
                <button onclick="increaseQty(${item.id})" class="bg-green-500 text-white px-2 rounded">+</button>
                <button onclick="removeFromCart(${item.id})" class="bg-red-500 text-white px-2 rounded">Remove</button>
            </div>
        </li>
        `;
    });

    html += `
        </ul>
        <div class="mt-4 flex justify-between items-center bg-gray-100 p-3 rounded">
            <h3 class="text-xl font-bold">Total: ₹${total}</h3>
            <button onclick="checkout()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">Checkout</button>
        </div>
    `;
    
    cartDiv.innerHTML = html;
}


function removeFromCart(id){
    let cart = JSON.parse(localStorage.getItem("cart"))||[];
    cart = cart.filter(item=>item.id!==id);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// ===== View Product =====
function viewProduct(id){
    const allProducts = JSON.parse(localStorage.getItem("allProducts")) || [];
    let product = allProducts.find(p => String(p.id) === String(id));

    // fallback if not found
    if (!product && typeof products !== "undefined") {
        product = products.find(p => String(p.id) === String(id));
    }

    if (product) {
        localStorage.setItem("selectedProduct", JSON.stringify(product));
         window.location.href = "product.html?id=" + id;
    } else {
        console.error("Product not found for id:", id);
    }
}

// ===== Toast =====
function showToast(msg){
    const t = document.createElement("div");
    t.textContent = msg;
    t.className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50";
    document.body.appendChild(t);
    setTimeout(()=> t.remove(),2000);
}

// ===== Search =====
const searchInput = document.getElementById("search");
if(searchInput){
    searchInput.addEventListener("input", e=>{
        const q = e.target.value.toLowerCase();
        renderProducts(products.filter(p=>p.title.toLowerCase().includes(q)));
    });
}

// ===== Store All Products =====
if(typeof products !== "undefined"){
    localStorage.setItem('allProducts', JSON.stringify(products));
}

// ===== Initial Render =====
if(typeof products !== "undefined"){
    renderProducts(products);
}
updateCartCount();
renderCart();

// ===== Quantity Controls =====
function increaseQty(id){
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const item = cart.find(p => p.id === id);
    if(item) item.quantity += 1;
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function decreaseQty(id){
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const item = cart.find(p => p.id === id);
    if(item){
        if(item.quantity > 1){
            item.quantity -= 1;
        } else {
            cart = cart.filter(p => p.id !== id);
        }
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// ===== Buy Now =====
function checkout(){
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if(cart.length === 0){
        alert("Your cart is empty!");
        return;
    }
    window.location.href = "checkout.html";
}
