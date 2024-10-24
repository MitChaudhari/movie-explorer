document.addEventListener('DOMContentLoaded', function () {
    const cardSlider = document.getElementById('cardSlider');
    const cardContainer = document.getElementById('cardContainer');
    let currentIndex = 0;
    let movies = [];
    let displayedMovies = []; // To keep track of currently displayed movies

    // Modal elements
    const modalOverlay = document.getElementById('modalOverlay');
    const closeButton = document.getElementById('closeButton');
    const movieTitle = document.getElementById('movieTitle');
    const movieDetails = document.getElementById('movieDetails');
    const slideshowContainer = document.getElementById('slideshowContainer');
    const modalContent = document.querySelector('.modal-content');

    // Auto-switching variables
    let autoSwitchInterval = 3000;
    let autoSwitchTimer;
    let isModalOpen = false; // Flag to track modal state
    let currentView = 'rotating';

    // Filter elements
    const filterForm = document.getElementById('filterForm');
    const yearFilter = document.getElementById('yearFilter');
    const genreFilter = document.getElementById('genreFilter');
    const languageFilter = document.getElementById('languageFilter');
    const filterButton = document.getElementById('filterButton');
    const resetButton = document.getElementById('resetButton');

    // Fetch movie data from JSON file
    fetch('assets/Film.JSON')
        .then(response => response.json())
        .then(data => {
            movies = data;
            displayedMovies = movies; // Initialize displayedMovies
            createCards(displayedMovies);
            updateActiveCard();

            // Start automatic switching after data is loaded
            startAutoSwitch();
        })
        .catch(error => console.error('Error fetching movie data:', error));

    function createCards(moviesList) {
        // Clear existing cards
        cardSlider.innerHTML = '';

        moviesList.forEach((movie, index) => {
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

            // Add click event to open modal
            card.addEventListener('click', () => {
                openModal(movie);
            });

            if (currentView === 'rotating') {
                // Add hover events to pause and resume auto-switching
                card.addEventListener('mouseenter', () => {
                    if (!isModalOpen) pauseAutoSwitch();
                });
                card.addEventListener('mouseleave', () => {
                    if (!isModalOpen) resumeAutoSwitch();
                });
            }
        });

        if (currentView === 'rotating') {
            cardSlider.classList.add('rotating-view');
            cardContainer.classList.add('rotating-view');
            updateActiveCard();
        } else {
            cardSlider.classList.remove('rotating-view');
            cardContainer.classList.remove('rotating-view');
        }
    }

    // Update active card based on currentIndex
    function updateActiveCard() {
        if (currentView !== 'rotating') return;

        const cards = document.querySelectorAll('.card');
        const totalCards = cards.length;

        cards.forEach((card, index) => {
            card.classList.remove(
                'active',
                'left',
                'right',
                'left2',
                'right2',
                'left3',
                'right3',
                'hidden'
            );

            let position = index - currentIndex;

            // Handle infinite looping
            if (position < -Math.floor(totalCards / 2)) {
                position += totalCards;
            }
            if (position > Math.floor(totalCards / 2)) {
                position -= totalCards;
            }

            // Assign classes based on position
            switch (position) {
                case 0:
                    card.classList.add('active');
                    break;
                case -1:
                    card.classList.add('left');
                    break;
                case 1:
                    card.classList.add('right');
                    break;
                case -2:
                    card.classList.add('left2');
                    break;
                case 2:
                    card.classList.add('right2');
                    break;
                case -3:
                    card.classList.add('left3');
                    break;
                case 3:
                    card.classList.add('right3');
                    break;
                default:
                    card.classList.add('hidden');
                    break;
            }
        });
    }

    // Automatic switching logic
    function startAutoSwitch() {
        if (currentView !== 'rotating' || isModalOpen) return;

        // Ensure the autoSwitchTimer is cleared before starting a new one
        if (autoSwitchTimer) {
            clearInterval(autoSwitchTimer);
        }

        autoSwitchTimer = setInterval(() => {
            // Increment the currentIndex with wrap-around logic
            currentIndex = (currentIndex + 1) % displayedMovies.length;

            // Update the active card with a smooth transition
            updateActiveCard();

            // Here we use Debounce to ensure transitions are smooth and cards don't skip
            pauseAutoSwitch();
            setTimeout(() => {
                if (!isModalOpen) { 
                    resumeAutoSwitch();
                }
            }, autoSwitchInterval); // Debounce based on autoSwitchInterval

        }, autoSwitchInterval); // Define the switch interval (e.g., 4000 ms)
    }

    // Pause and resume functions
    function pauseAutoSwitch() {
        if (autoSwitchTimer) {
            clearInterval(autoSwitchTimer); // Clear the interval to stop the switching
            autoSwitchTimer = null;
        }
    }

    function resumeAutoSwitch() {
        // Resume auto-switching only if it is paused and the modal is not open
        if (!autoSwitchTimer && !isModalOpen && currentView === 'rotating') {
            startAutoSwitch();
        }
    }


    // Filtering logic
    filterForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get filter values
        const year = yearFilter.value;
        const genre = genreFilter.value;
        const language = languageFilter.value;

        // Filter movies
        displayedMovies = movies.filter(movie => {
            let match = true;
            if (year && movie.Year !== year) {
                match = false;
            }
            if (genre) {
                const genres = movie.Genre.split(',').map(g => g.trim());
                if (!genres.includes(genre)) {
                    match = false;
                }
            }
            if (language) {
                const languages = movie.Language.split(',').map(l => l.trim());
                if (!languages.includes(language)) {
                    match = false;
                }
            }
            return match;
        });

        if (displayedMovies.length === 0) {
            // If no movies are found, show "No Results Found" message
            cardSlider.innerHTML = '<p class="no-results">No results found. Please try different filters.</p>';
        } else {
            // If movies are found, switch to grid view and display the cards
            currentView = 'grid';

            // Clear auto-switching if active
            pauseAutoSwitch();

            cardSlider.classList.add('grid-view');

            currentIndex = 0;

            createCards(displayedMovies);

            // Scroll to the results
            cardContainer.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });

    // Reset button logic
    resetButton.addEventListener('click', () => {
        // Reset filters
        filterForm.reset();

        // Switch back to rotating view
        currentView = 'rotating';

        // Start auto-switching
        startAutoSwitch();

        // Update cardSlider class
        cardSlider.classList.remove('grid-view');

        // Reset currentIndex
        currentIndex = 0;

        // Render all movies
        displayedMovies = movies;
        createCards(displayedMovies);
    });

    // Open Modal Function
    function openModal(movie) {
        // Pause auto-switching when modal is open
        pauseAutoSwitch();
        isModalOpen = true;

        // Display modal
        modalOverlay.style.display = 'flex';

        // Set movie title
        movieTitle.textContent = movie.Title;

        // Clear previous details and slideshow
        movieDetails.innerHTML = '';
        slideshowContainer.innerHTML = '';

        // Populate movie details
        const details = {
            'Year': movie.Year,
            'Rated': movie.Rated,
            'Released': movie.Released,
            'Runtime': movie.Runtime,
            'Genre': movie.Genre,
            'Director': movie.Director,
            'Language': movie.Language,
            'Awards': movie.Awards,
            'IMDb Rating': movie.imdbRating
        };

        for (let key in details) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${key}:</strong> ${details[key]}`;
            movieDetails.appendChild(li);
        }

        // Create slideshow
        let slideIndex = 0;
        movie.Images.forEach((imageSrc, index) => {
            const slide = document.createElement('div');
            slide.classList.add('mySlides');
            if (index !== 0) {
                slide.style.display = 'none';
            }

            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = `${movie.Title} Image ${index + 1}`;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.onerror = function () {
                img.src = 'assets/ReelProjector.gif';
            };

            slide.appendChild(img);
            slideshowContainer.appendChild(slide);
        });

        // Start slideshow
        let slides = slideshowContainer.getElementsByClassName('mySlides');
        let slideInterval = setInterval(() => {
            slides[slideIndex].style.display = 'none';
            slideIndex = (slideIndex + 1) % slides.length;
            slides[slideIndex].style.display = 'block';
        }, 2000);

        // Close modal event
        closeButton.onclick = () => {
            modalOverlay.style.display = 'none';
            clearInterval(slideInterval);
            isModalOpen = false;
            resumeAutoSwitch();
        };

        // Click outside modal to close
        modalOverlay.onclick = (event) => {
            if (event.target === modalOverlay) {
                modalOverlay.style.display = 'none';
                clearInterval(slideInterval);
                isModalOpen = false;
                resumeAutoSwitch();
            }
        };

        // Prevent clicks inside modal-content from closing the modal
        modalContent.onclick = (event) => { //
            event.stopPropagation();
        };
    }
});