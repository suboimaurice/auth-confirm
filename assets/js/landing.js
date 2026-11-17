const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
// Dark mode
const themeToggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("authconfirm-theme");

const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const initialTheme = savedTheme || preferredTheme;

document.documentElement.setAttribute("data-theme", initialTheme);

function updateThemeButton(theme) {
    const nextTheme = theme === "dark" ? "light" : "dark";

    themeToggle.setAttribute(
        "aria-label",
        `Switch to ${nextTheme} mode`
    );
}

updateThemeButton(initialTheme);

themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");

    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);

    localStorage.setItem("authconfirm-theme", newTheme);

    updateThemeButton(newTheme);
});

// Mobile navigation
menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");

    menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
    );
});

// Close menu after selecting a navigation link
navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
    });
});
// =================================
// SCROLL ANIMATION CONTROLLER
// =================================

document.documentElement.classList.add("js-motion");

const animatedElements = document.querySelectorAll("[data-animate]");

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

if (prefersReducedMotion) {
    animatedElements.forEach(element => {
        element.classList.add("is-visible");
    });
} else {
    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");

                // Animate once
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px"
    });

    animatedElements.forEach(element => {
        animationObserver.observe(element);
    });
}

// Stagger animation delays
document.querySelectorAll("[data-stagger]").forEach(container => {
    [ ...container.children ].forEach((child, index) => {
        child.style.setProperty(
            "--stagger-delay",
            `${index * 150}ms`
        );
    });
});

/* =========================================
   CODE EXAMPLE SLIDER
========================================= */

const showcaseTrack = document.getElementById("showcaseTrack");
const showcaseDots = document.querySelectorAll("#showcaseDots button");

const codePrev = document.getElementById("codePrev");
const codeNext = document.getElementById("codeNext");
const codeSlideCount = document.getElementById("codeSlideCount");

if (showcaseTrack && showcaseDots.length) {

    const totalSlides = showcaseDots.length;

    let currentSlide = 0;
    let slideInterval;

    function updateSlide() {

        showcaseTrack.style.transform =
            `translateX(-${currentSlide * 100}%)`;

        showcaseDots.forEach((dot, index) => {

            dot.classList.toggle(
                "active",
                index === currentSlide
            );

        });

        if (codeSlideCount) {

            codeSlideCount.textContent =
                `${String(currentSlide + 1).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}`;

        }

    }

    function nextSlide() {

        currentSlide = (currentSlide + 1) % totalSlides;

        updateSlide();

    }

    function previousSlide() {

        currentSlide =
            (currentSlide - 1 + totalSlides) % totalSlides;

        updateSlide();

    }

    function startSlider() {

        stopSlider();

        slideInterval = setInterval(nextSlide, 6000);

    }

    function stopSlider() {

        clearInterval(slideInterval);

    }

    codeNext?.addEventListener("click", () => {

        nextSlide();
        startSlider();

    });

    codePrev?.addEventListener("click", () => {

        previousSlide();
        startSlider();

    });

    showcaseDots.forEach((dot, index) => {

        dot.addEventListener("click", () => {

            currentSlide = index;

            updateSlide();

            startSlider();

        });

    });

    // Pause automatic sliding while the user
    // interacts with the showcase.
    const showcase = document.querySelector(".showcase-card");

    showcase?.addEventListener("mouseenter", stopSlider);
    showcase?.addEventListener("mouseleave", startSlider);

    showcase?.addEventListener("focusin", stopSlider);
    showcase?.addEventListener("focusout", startSlider);

    updateSlide();

    startSlider();

}

// Current year
document.getElementById("year").textContent =
    new Date().getFullYear();