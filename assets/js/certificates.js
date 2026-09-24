document.addEventListener('DOMContentLoaded', () => {
    new Swiper('.certs-slider', {
        speed: 600,
        loop: false,
        slidesPerView: 1,
        spaceBetween: 24,
        navigation: {
            nextEl: '#certNext',
            prevEl: '#certPrev',
        },
        pagination: {
            el: '#certPagination',
            type: 'bullets',
            clickable: true,
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            992: {
                slidesPerView: 3,
                spaceBetween: 24
            }
        }
    });

    // CTF Walkthroughs Paginated Slider
    new Swiper('.ctf-slider', {
        speed: 500,
        autoHeight: true,
        slidesPerView: 1,
        spaceBetween: 30,
        navigation: {
            nextEl: '#ctfNext',
            prevEl: '#ctfPrev',
        },
        pagination: {
            el: '#ctfPagination',
            type: 'bullets',
            clickable: true,
        }
    });
});

// Open CTF in a new tab
document.addEventListener('DOMContentLoaded', () => {
    // Target all CTF links and open them in a new tab
    const ctfLinks = document.querySelectorAll('#ctf .ctf-page-grid a');
    ctfLinks.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });
});