document.addEventListener('DOMContentLoaded', () => {
  const servicesGrid = document.getElementById('services-grid');
  const testimonialsGrid = document.getElementById('testimonials-grid');
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const quickForm = document.getElementById('quick-form');
  const formFeedback = document.getElementById('form-feedback');
  const serviceSelect = document.getElementById('q-service');

  // 1. Sticky Navbar Shadow on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. Mobile Navigation Toggle
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // 3. Intersection Observer for Smooth Scroll Reveals
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const initRevealElements = () => {
    document.querySelectorAll('.reveal').forEach(el => {
      revealObserver.observe(el);
    });
  };

  // 4. Load Data from data.json
  fetch('JSON/data.json')
    .then(response => {
      if (!response.ok) throw new Error('Could not load data.json');
      return response.json();
    })
    .then(data => {
      renderServices(data.services);
      renderTestimonials(data.testimonials);
      initRevealElements();
    })
    .catch(err => {
      console.error('Data load error:', err);
      initRevealElements();
    });

  function renderServices(services) {
    if (!servicesGrid || !services) return;
    servicesGrid.innerHTML = services.map((service, index) => `
      <article class="service-card reveal" style="transition-delay: ${(index % 3) * 0.1}s">
        <div>
          <span class="service-cat">${service.category}</span>
          <h3>${service.title}</h3>
          <p>${service.description}</p>
          <ul class="service-features">
            ${service.features.map(feat => `<li>${feat}</li>`).join('')}
          </ul>
        </div>
        <div class="service-price-box">
          <div>
            <span class="price-label">Starting at</span>
            <span class="price-value">${service.minPrice}</span>
          </div>
          <button type="button" class="btn-select-service" data-service="${service.title}">
            Select Service
          </button>
        </div>
      </article>
    `).join('');

    // Attach click handlers to pre-fill form when user clicks "Select Service"
    document.querySelectorAll('.btn-select-service').forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = btn.getAttribute('data-service');
        if (serviceSelect) {
          for (let option of serviceSelect.options) {
            if (option.value.toLowerCase().includes(chosen.split(' ')[0].toLowerCase())) {
              serviceSelect.value = option.value;
              break;
            }
          }
        }
        document.getElementById('quick-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('q-name').focus();
      });
    });
  }

  function renderTestimonials(testimonials) {
    if (!testimonialsGrid || !testimonials) return;
    testimonialsGrid.innerHTML = testimonials.map((item, index) => `
      <div class="testimonial-card reveal" style="transition-delay: ${index * 0.12}s">
        <div class="stars">★★★★★</div>
        <p>"${item.text}"</p>
        <div class="testimonial-author">
          <strong>${item.author}</strong>
          <span>${item.role}</span>
        </div>
      </div>
    `).join('');
  }

  // 5. Form Submission Handler (Ready to connect to Formspree, Web3Forms, or EmailJS)
  if (quickForm) {
    quickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('q-name').value.trim();
      const service = serviceSelect.value || 'Construction Inquiry';
      
      formFeedback.textContent = `Thank you, ${name}. Your request for ${service} has been prepared. Juan Narro will contact you shortly.`;
      quickForm.reset();
    });
  }
});