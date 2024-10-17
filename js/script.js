// script.js

document.addEventListener('DOMContentLoaded', function () {
    const cardSlider = document.getElementById('cardSlider');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    let currentIndex = 0;
    let movies = [];

    // Fetch movie data from JSON file
    fetch('assets/Film.JSON')
        .then(response => response.json())
        .then(data => {
            movies = data;
            createCards(movies);
            updateActiveCard();
        })
        .catch(error => console.error('Error fetching movie data:', error));

    function createCards(movies) {
        movies.forEach((movie, index) => {
            console.log('Image URL:', movie.Poster); // Log the image URLs for debugging

            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.index = index;

            const img = document.createElement('img');
            img.src = movie.Poster;
            img.alt = movie.Title;

            img.onerror = function () {
                img.src = 'assets/ReelProjector.gif';
            };
            
            card.appendChild(img);
            cardSlider.appendChild(card);
        });
    }

    // Update active card based on currentIndex
    function updateActiveCard() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.classList.remove('active');
        });

        // Adjust transform to center the active card
        const offset = -currentIndex * (200 + 20); // Card width + margin (both sides)
        cardSlider.style.transform = `translateX(${offset}px)`;

        // Add active class to the current card
        const activeCard = cards[currentIndex];
        if (activeCard) {
            activeCard.classList.add('active');
        }
    }

    // Event listeners for navigation buttons
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateActiveCard();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentIndex < movies.length - 1) {
            currentIndex++;
            updateActiveCard();
        }
    });

    // Swipe functionality for touch devices
    let startX = 0;
    let isDragging = false;

    cardSlider.addEventListener('touchstart', touchStart);
    cardSlider.addEventListener('touchmove', touchMove);
    cardSlider.addEventListener('touchend', touchEnd);

    function touchStart(event) {
        startX = event.touches[0].clientX;
        isDragging = true;
    }

    function touchMove(event) {
        if (!isDragging) return;
        const currentX = event.touches[0].clientX;
        const deltaX = startX - currentX;

        if (deltaX > 50) {
            // Swipe left
            isDragging = false;
            if (currentIndex < movies.length - 1) {
                currentIndex++;
                updateActiveCard();
            }
        } else if (deltaX < -50) {
            // Swipe right
            isDragging = false;
            if (currentIndex > 0) {
                currentIndex--;
                updateActiveCard();
            }
        }
    }

    function touchEnd() {
        isDragging = false;
    }
});
