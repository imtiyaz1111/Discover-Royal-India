document.addEventListener('DOMContentLoaded', () => {
    // 1. Dynamic Component Loader
    async function loadComponent(placeholderId, filePath, callback) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) {
            // If placeholder not found, execute callback immediately
            if (callback) callback();
            return;
        }
        try {
            const response = await fetch(filePath);
            if (response.ok) {
                const html = await response.text();
                placeholder.outerHTML = html;
                if (callback) callback();
            } else {
                console.error(`Failed to load component: ${filePath}`);
                if (callback) callback();
            }
        } catch (error) {
            console.error(`Error loading component: ${filePath}`, error);
            if (callback) callback();
        }
    }

    // Load both navbar and footer components
    loadComponent('navbar-placeholder', 'components/navbar.html', () => {
        loadComponent('footer-placeholder', 'components/footer.html', () => {
            initializeInteractivity();
        });
    });

    // 2. Initialize Page Interactivity (after navbar & footer load)
    function initializeInteractivity() {
        // Sticky Navigation on Scroll
        const headerWrapper = document.querySelector('.header-wrapper');
        const topBar = document.querySelector('.top-bar');

        if (headerWrapper) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    headerWrapper.classList.add('sticky');
                    if (topBar) {
                        topBar.style.marginTop = `-${topBar.offsetHeight}px`;
                    }
                } else {
                    headerWrapper.classList.remove('sticky');
                    if (topBar) {
                        topBar.style.marginTop = '0px';
                    }
                }
            });
        }

        // Mobile Menu Toggle Drawer
        const mobileMenuOpenBtn = document.querySelector('.mobile-toggle');
        const mobileNavDrawer = document.getElementById('mobileNavDrawer');
        const drawerCloseBtn = document.querySelector('.drawer-close');
        const overlayBackdrop = document.getElementById('overlayBackdrop');

        function openDrawer() {
            if (mobileNavDrawer && overlayBackdrop) {
                mobileNavDrawer.classList.add('open');
                overlayBackdrop.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        }

        function closeDrawer() {
            if (mobileNavDrawer && overlayBackdrop) {
                mobileNavDrawer.classList.remove('open');
                overlayBackdrop.classList.remove('show');
                document.body.style.overflow = '';
            }
        }

        if (mobileMenuOpenBtn) {
            mobileMenuOpenBtn.addEventListener('click', openDrawer);
        }

        if (drawerCloseBtn) {
            drawerCloseBtn.addEventListener('click', closeDrawer);
        }

        if (overlayBackdrop) {
            overlayBackdrop.addEventListener('click', closeDrawer);
        }

        // Mobile Menu Dropdown Accordion/Toggle
        const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
        mobileDropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const parent = toggle.parentElement;
                parent.classList.toggle('open');
            });
        });
        
        // Highlight active page link in menu based on current path
        const currentPath = window.location.pathname.split("/").pop();
        const allLinks = document.querySelectorAll('.nav-link, .mobile-link');
        
        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '' && href === 'index.html')) {
                allLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    }

    // 3. Hero Background Image Slider (always runs if slides are present)
    const slides = document.querySelectorAll('.hero-slider .slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    
    // Slide content data matching Agra/Taj Mahal, Rajasthan, and Kerala
    const heroContentData = [
        {
            subtitle: "Experience Heritage & Splendor",
            title: "Discover <span>Royal India</span>",
            description: "Embark on an unforgettable bespoke journey through majestic palaces, sacred temples, and vibrant landscapes custom-tailored for international explorers."
        },
        {
            subtitle: "Royal Forts & Golden Deserts",
            title: "Majestic <span>Rajasthan</span>",
            description: "Explore legendary fortresses, luxurious heritage palaces, and the rich cultural tapestry of the land of Kings."
        },
        {
            subtitle: "Serene Backwaters & Lush Hills",
            title: "Tranquil <span>Kerala Paradise</span>",
            description: "Relax in luxury houseboats, rejuvenate with authentic Ayurveda, and discover beautiful tropical coastlines."
        }
    ];

    const subtitleEl = document.querySelector('.hero-content .hero-subtitle');
    const titleEl = document.querySelector('.hero-content .hero-title');
    const descriptionEl = document.querySelector('.hero-content .hero-description');
    
    if (slides.length > 0) {
        let currentSlide = 0;
        const slideInterval = 6000; // 6 seconds

        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));

            slides[index].classList.add('active');
            if (dots[index]) {
                dots[index].classList.add('active');
            }

            // Sync and animate content change
            if (subtitleEl && titleEl && descriptionEl && heroContentData[index]) {
                const data = heroContentData[index];
                
                // Temporarily remove animation
                subtitleEl.style.animation = 'none';
                titleEl.style.animation = 'none';
                descriptionEl.style.animation = 'none';
                
                // Trigger reflow to restart animation
                void subtitleEl.offsetWidth;
                void titleEl.offsetWidth;
                void descriptionEl.offsetWidth;
                
                // Set text/html
                subtitleEl.textContent = data.subtitle;
                titleEl.innerHTML = data.title;
                descriptionEl.textContent = data.description;
                
                // Re-apply animations
                subtitleEl.style.animation = 'fadeInDown 1s ease forwards';
                titleEl.style.animation = 'fadeInUp 1s ease 0.2s both';
                descriptionEl.style.animation = 'fadeInUp 1s ease 0.4s both';
            }

            currentSlide = index;
        }

        function nextSlide() {
            let next = (currentSlide + 1) % slides.length;
            showSlide(next);
        }

        // Auto slide
        let slideTimer = setInterval(nextSlide, slideInterval);
        // Click on dots
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                clearInterval(slideTimer);
                showSlide(idx);
                slideTimer = setInterval(nextSlide, slideInterval);
            });
        });
    }

    // 4. Travelers & Preferences Drag & Auto-slider
    const sliderWrapper = document.getElementById('categoriesSliderWrapper');
    const slider = document.getElementById('categoriesSlider');
    const navDots = document.querySelectorAll('.slider-nav-dots .nav-dot');
    
    if (sliderWrapper && slider) {
        let isDown = false;
        let startX;
        let scrollLeft;
        let autoScrollTimer;
        const scrollSpeed = 0.8; // Smooth, slow speed of auto scroll step
        let scrollDirection = 1; // 1 for right, -1 for left
        
        // Mouse/Touch Drag Scroll
        sliderWrapper.addEventListener('mousedown', (e) => {
            isDown = true;
            sliderWrapper.classList.add('active');
            startX = e.pageX - sliderWrapper.offsetLeft;
            scrollLeft = sliderWrapper.scrollLeft;
            stopAutoScroll();
        });
        
        sliderWrapper.addEventListener('mouseleave', () => {
            isDown = false;
            startAutoScroll();
        });
        
        sliderWrapper.addEventListener('mouseup', () => {
            isDown = false;
            startAutoScroll();
        });
        
        sliderWrapper.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - sliderWrapper.offsetLeft;
            const walk = (x - startX) * 2.5; // Drag sensitivity
            sliderWrapper.scrollLeft = scrollLeft - walk;
            updateDots();
        });

        // Touch support
        sliderWrapper.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - sliderWrapper.offsetLeft;
            scrollLeft = sliderWrapper.scrollLeft;
            stopAutoScroll();
        });

        sliderWrapper.addEventListener('touchend', () => {
            isDown = false;
            startAutoScroll();
        });

        sliderWrapper.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX - sliderWrapper.offsetLeft;
            const walk = (x - startX) * 2;
            sliderWrapper.scrollLeft = scrollLeft - walk;
            updateDots();
        });

        // Auto Scroll Functionality
        function startAutoScroll() {
            if (autoScrollTimer) clearInterval(autoScrollTimer);
            autoScrollTimer = setInterval(() => {
                if (isDown) return;
                
                // Advance scroll
                sliderWrapper.scrollLeft += scrollDirection * scrollSpeed;
                
                // Reverse direction at bounds
                const maxScrollLeft = sliderWrapper.scrollWidth - sliderWrapper.clientWidth;
                if (sliderWrapper.scrollLeft >= maxScrollLeft - 1) {
                    scrollDirection = -1;
                } else if (sliderWrapper.scrollLeft <= 1) {
                    scrollDirection = 1;
                }
                
                updateDots();
            }, 30);
        }
        
        function stopAutoScroll() {
            clearInterval(autoScrollTimer);
        }
        
        // Hover listeners to pause/play auto-scroll
        sliderWrapper.addEventListener('mouseenter', stopAutoScroll);
        sliderWrapper.addEventListener('mouseleave', startAutoScroll);
        
        // Update Indicator Dots
        function updateDots() {
            if (!navDots.length) return;
            const maxScrollLeft = sliderWrapper.scrollWidth - sliderWrapper.clientWidth;
            if (maxScrollLeft <= 0) return;
            
            const scrollPercent = sliderWrapper.scrollLeft / maxScrollLeft;
            const activeIndex = Math.min(
                Math.floor(scrollPercent * navDots.length),
                navDots.length - 1
            );
            
            navDots.forEach((dot, idx) => {
                if (idx === activeIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
        
        // Click on dots to jump scroll
        navDots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                const maxScrollLeft = sliderWrapper.scrollWidth - sliderWrapper.clientWidth;
                const targetScroll = (idx / (navDots.length - 1)) * maxScrollLeft;
                
                stopAutoScroll();
                sliderWrapper.scrollTo({
                    left: targetScroll,
                    behavior: 'smooth'
                });
                
                setTimeout(startAutoScroll, 1000); // Resume auto scroll after scroll completes
            });
        });
        
        // Start auto scroll initially
        startAutoScroll();
    }

    // 5. Description collapse toggles (Rajasthan, Golden Triangle, North India, South India)
    function setupDescToggle(toggleId, descId) {
        const toggle = document.getElementById(toggleId);
        const desc = document.getElementById(descId);
        if (toggle && desc) {
            toggle.addEventListener('click', () => {
                desc.classList.toggle('expanded');
                toggle.classList.toggle('active');
                if (desc.classList.contains('expanded')) {
                    toggle.innerHTML = `Read Less <i class="ri-arrow-up-s-line"></i>`;
                } else {
                    toggle.innerHTML = `Read More <i class="ri-arrow-down-s-line"></i>`;
                }
            });
        }
    }
    setupDescToggle('readMoreToggle', 'rajasthanDesc');
    setupDescToggle('goldenReadMoreToggle', 'goldenDesc');
    setupDescToggle('northReadMoreToggle', 'northDesc');
    setupDescToggle('southReadMoreToggle', 'southDesc');

    // 6. Testimonial Swiper Initialization
    if (typeof Swiper !== 'undefined') {
        new Swiper('.testimonial-swiper', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        });
    }

    // 7. FAQ Accordion Toggle
    const accordionHeaders = document.querySelectorAll('.faq-section .accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const currentItem = header.parentElement;
            const isOpen = currentItem.classList.contains('active');
            
            // Close all items
            document.querySelectorAll('.faq-section .accordion-item').forEach(item => {
                item.classList.remove('active');
                const icon = item.querySelector('.toggle-icon');
                if (icon) {
                    icon.className = 'ri-add-line toggle-icon';
                }
            });
            
            // If the item wasn't open, open it
            if (!isOpen) {
                currentItem.classList.add('active');
                const icon = currentItem.querySelector('.toggle-icon');
                if (icon) {
                    icon.className = 'ri-subtract-line toggle-icon';
                }
            }
        });
    });

    // 8. India Trip By Theme Collapse Toggle
    setupDescToggle('themeReadMoreToggle', 'themeDesc');

    // 9. India Trip By Theme Swiper Slider
    if (typeof Swiper !== 'undefined') {
        new Swiper('.theme-swiper', {
            slidesPerView: 1,
            spaceBetween: 24,
            loop: true,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: '#themeNextBtn',
                prevEl: '#themePrevBtn',
            },
            breakpoints: {
                640: {
                    slidesPerView: 2,
                },
                1024: {
                    slidesPerView: 3,
                }
            }
        });
    }

    // 10. Scroll To Top Button Logic
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
