// variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
//cart
let cart = [];
//buttons
let buttonsDOM = [];

// getting the products
class Products {
	async getProducts() {
		try {
			let result = await fetch('products.json');
			let data = await result.json();
			let products = data.items;
			//json data format returned by Contentful is multi-nested, we do the following to simplify the structure
			products = products.map(item => {
				const { title, price } = item.fields;//destructuring - get title and price and assign the same from item.fields
				const { id } = item.sys; //destructuring
				const image = item.fields.image.fields.file.url;//direct path, so no need for destructuring
				return { title, price, id, image }
			})
			return products;
		} catch (error) {
			console.log(error);
		}
	}
}
// display products
class UI {
	displayProducts(products) {
		let result = '';
		products.forEach(product => {
			// either the following or use document.createElement('div') and append to the parent elements, repeating for all elements
			result += `
				<article class="product">
					<div class="img-container">
						<img src=${product.image} alt=${product.title} class="product-img">
						<button class="bag-btn" data-id=${product.id}>
							<i class="fas fa-shopping-cart"></i>
							add to bag
						</button>
					</div>
					<h3>${product.title}</h3>
					<h4>$${product.price}</h4>
				</article>`;
		});
		productsDOM.innerHTML = result;
	}
	//called when document is parsed and products are loaded
	getBagButtons() {
		const buttons = [...document.querySelectorAll(".bag-btn")];//using spread operator returns array of buttons otherwise a nodelist
		buttonsDOM = buttons;
		buttons.forEach(button => {
			let id = button.dataset.id;
			let inCart = cart.find(item => item.id === id);
			if (inCart) {//if item already in cart
				button.innerText = "In Cart";
				button.disabled = true
			}
			//add event listener to current button if not already in cart
			button.addEventListener('click', (event) => {
				event.target.innerText = "In Cart";
				event.target.disabled = true;
				//get product from products-from storage
				let cartItem = { ...Storage.getProduct(id), quantity: 1 };//get the product and add quantity
				//add product to the cart
				cart = [...cart, cartItem];
				//save cart in local storage, so even when user closes and reopens window we show the cart
				Storage.saveCart(cart);
				//set cart values
				this.setCartValues(cart);
				//display cart item
				this.addCartItem(cartItem);
				//show the cart
			})
		})
	}
	//when buttons are clicked, update the total price and total items count
	setCartValues(cart) {
		let priceTotal = 0;
		let itemsTotal = 0;
		cart.map(item => {
			priceTotal += item.price * item.quantity;
			itemsTotal += item.quantity;
		})
		cartTotal.innerText = parseFloat(priceTotal.toFixed(2));
		cartItems.innerText = itemsTotal
	}
	addCartItem(cartItem) {
		const div = document.createElement('div');
		div.classList.add('cart-item');
		div.innerHTML = `
						<img src=${cartItem.image} alt=${cartItem.title}>
                        <div>
                            <h4>${cartItem.title}</h4>
                            <h5>$${cartItem.price}</h5>
                            <span class="remove-item" data-id=${item.id}>remove</span>
                        </div>
                        <div>
                            <i class="fas fa-chevron-up"></i>
                            <p class="item-amount">1</p>
                            <i class="fas fa-chevron-down"></i>
                        </div>`
	}
}
// local storage
class Storage {
	//static methods are often used to define utility functions and their needn't be instantiated.
	static saveProducts(products) {
		localStorage.setItem("products", JSON.stringify(products));//storing locally just to avoid calling contentFul eveytime we need info about a specific product
	}
	static getProduct(id) {
		let products = JSON.parse(localStorage.getItem('products'));
		return products.find(product => product.id === id)
	}
	static saveCart(cart) {
		localStorage.setItem('cart', JSON.stringify(cart));//stringify to save as text
	}

}
//Event listeners for when initial HTML is finished loading and parsing
document.addEventListener("DOMContentLoaded", () => {
	//creating instances
	const ui = new UI();
	const products = new Products();

	//get all products
	products.getProducts().then(products => {
		ui.displayProducts(products)
		Storage.saveProducts(products)
	}).then(() => {//after products load, get add to bag buttons to let user add products to cart, update content when added to cart
		ui.getBagButtons();
	});
})