"use strict";

const slideData = JSON.parse(document.querySelector("#slide-data").textContent);
const slidesContainer = document.querySelector(".slides");
const currentSlideLabel = document.querySelector(".current-slide");
const totalSlidesLabel = document.querySelector(".total-slides");
const previousButton = document.querySelector(".slider-button.previous");
const nextButton = document.querySelector(".slider-button.next");
const autoplayButton = document.querySelector(".autoplay-toggle");
const slider = document.querySelector(".slider");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (!Array.isArray(slideData) || slideData.length === 0) {
  throw new Error("Slide data must be a non-empty JSON array.");
}

function createSlide(project, index) {
  const slide = document.createElement("article");
  slide.className = index === 0 ? "slide is-active" : "slide";
  slide.setAttribute("aria-roledescription", "slide");
  slide.setAttribute("aria-label", `${index + 1} of ${slideData.length}`);
  slide.hidden = index !== 0;

  const image = document.createElement("img");
  image.className = "slide-image";
  image.src = project.image;
  image.alt = project.alt;
  if (index === 0) {
    image.fetchPriority = "high";
  } else {
    image.loading = "lazy";
  }
  slide.append(image, createElementWithClass("div", "image-shade"));

  const content = createElementWithClass("div", "slide-content");
  const projectType = createElementWithClass("span", "project-type");
  projectType.textContent = `${String(index + 1).padStart(2, "0")} / ${project.type}`;
  const title = document.createElement("h2");
  project.title.split("\n").forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      title.append(document.createElement("br"));
    }
    title.append(document.createTextNode(line));
  });
  const description = document.createElement("p");
  description.textContent = project.description;
  const link = createElementWithClass("a", "project-cta");
  link.href = project.link;
  link.append(document.createTextNode(`${project.action} `));
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↗";
  link.append(arrow);
  content.append(projectType, title, description, link);
  slide.append(content);

  const imageIndex = createElementWithClass("span", "image-index");
  imageIndex.setAttribute("aria-hidden", "true");
  imageIndex.textContent = String(index + 1).padStart(2, "0");
  slide.append(imageIndex);
  return slide;
}

function createElementWithClass(tagName, className) {
  const element = document.createElement(tagName);
  element.className = className;
  return element;
}

slidesContainer.replaceChildren(...slideData.map(createSlide));
const slides = Array.from(slidesContainer.querySelectorAll(".slide"));
totalSlidesLabel.textContent = String(slides.length).padStart(2, "0");

let activeIndex = 0;
let autoplayTimer;
let autoplayPaused = false;

function showSlide(index) {
  activeIndex = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeIndex;
    slide.hidden = !isActive;
    slide.classList.toggle("is-active", isActive);
  });

  currentSlideLabel.textContent = String(activeIndex + 1).padStart(2, "0");
}

function stopAutoplay() {
  window.clearInterval(autoplayTimer);
}

function startAutoplay() {
  stopAutoplay();
  if (
    !reducedMotion.matches &&
    !autoplayPaused &&
    !document.hidden &&
    !slider.matches(":hover") &&
    !slider.contains(document.activeElement)
  ) {
    autoplayTimer = window.setInterval(() => showSlide(activeIndex + 1), 5000);
  }
}

previousButton.addEventListener("click", () => {
  showSlide(activeIndex - 1);
});

nextButton.addEventListener("click", () => {
  showSlide(activeIndex + 1);
});

autoplayButton.addEventListener("click", () => {
  autoplayPaused = !autoplayPaused;
  const label = autoplayPaused ? "Resume slideshow" : "Pause slideshow";
  autoplayButton.setAttribute("aria-label", label);
  autoplayButton.setAttribute("aria-pressed", String(autoplayPaused));
  autoplayButton.querySelector("span").textContent = autoplayPaused ? "▶" : "Ⅱ";
  startAutoplay();
});

slider.addEventListener("mouseenter", stopAutoplay);
slider.addEventListener("mouseleave", startAutoplay);
slider.addEventListener("focusin", stopAutoplay);
slider.addEventListener("focusout", startAutoplay);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAutoplay();
  } else {
    startAutoplay();
  }
});

reducedMotion.addEventListener("change", startAutoplay);

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.querySelector(".sr-only").textContent = isExpanded
    ? "Open navigation menu"
    : "Close navigation menu";
  navigation.classList.toggle("is-open", !isExpanded);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.querySelector(".sr-only").textContent = "Open navigation menu";
    navigation.classList.remove("is-open");
  }
});

document.querySelector("#year").textContent = String(new Date().getFullYear());
startAutoplay();
