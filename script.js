
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const themeToggle = document.getElementById("themeToggle");
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");

  // Current year
  document.getElementById("currentYear").textContent =
    new Date().getFullYear();

  // Mobile navigation
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.innerHTML = isOpen
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
  });

  // Dark/light theme
  function updateThemeIcon() {
    const isLight = document.body.classList.contains("light-theme");
    themeToggle.innerHTML = isLight
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';

    themeToggle.setAttribute(
      "aria-label",
      isLight ? "Switch to dark theme" : "Switch to light theme"
    );
  }

  try {
    if (localStorage.getItem("portfolio-theme") === "light") {
      document.body.classList.add("light-theme");
    }
  } catch (error) {
    // The website still works if browser storage is unavailable.
  }

  updateThemeIcon();

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");

    try {
      localStorage.setItem(
        "portfolio-theme",
        document.body.classList.contains("light-theme")
          ? "light"
          : "dark"
      );
    } catch (error) {
      // Theme still changes for the current page.
    }

    updateThemeIcon();
  });

  // Highlight the active section in the navigation
  const sections = document.querySelectorAll("main section[id]");
  const navItems = document.querySelectorAll(".nav-link");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navItems.forEach(link => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${entry.target.id}`
            );
          });
        }
      });
    }, {
      rootMargin: "-20% 0px -65% 0px"
    });

    sections.forEach(section => observer.observe(section));
  }

  // Contact form submission
  contactForm.addEventListener("submit", async event => {
    event.preventDefault();

    formStatus.textContent = "";
    formStatus.className = "form-status";
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';

    const formData = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      subject: document.getElementById("subject").value.trim(),
      message: document.getElementById("message").value.trim()
    };

    if (!formData.name || !formData.email ||
        !formData.subject || !formData.message) {
      formStatus.textContent = "Please fill in all fields.";
      formStatus.classList.add("error");
      submitBtn.disabled = false;
      submitBtn.innerHTML =
        'Send Message <i class="fa-solid fa-paper-plane"></i>';
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not send your message.");
      }

      formStatus.textContent = result.message;
      formStatus.classList.add("success");
      contactForm.reset();
    } catch (error) {
      formStatus.textContent =
        error.message || "Unable to send your message. Please try again.";
      formStatus.classList.add("error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML =
        'Send Message <i class="fa-solid fa-paper-plane"></i>';
    }
  });
});
