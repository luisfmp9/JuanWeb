document.addEventListener('DOMContentLoaded', () => {
  const servicesGrid = document.getElementById('services-grid');
  const testimonialsGrid = document.getElementById('testimonials-grid');
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const quickForm = document.getElementById('quick-form');
  const serviceSelect = document.getElementById('q-service');

  // 1. Sticky Navbar Shadow
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. Mobile Navigation Toggle
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // 3. Smooth Scroll Reveal Observer
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  const initRevealElements = () => {
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  };

  // 4. Load Services & Testimonials from JSON/data.json
  if (servicesGrid || testimonialsGrid) {
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
  } else {
    initRevealElements();
  }

  function renderServices(services) {
    if (!servicesGrid || !services) return;
    servicesGrid.innerHTML = services.map((service, index) => `
      <article class="service-card reveal" style="transition-delay: ${(index % 3) * 0.1}s">
        <header>
          <span class="service-cat">${service.category}</span>
          <h3>${service.title}</h3>
          <p>${service.description}</p>
          <ul class="service-features">
            ${service.features.map(feat => `<li>${feat}</li>`).join('')}
          </ul>
        </header>
        <footer class="service-price-box">
          <p>
            <span class="price-label">Starting at</span>
            <strong class="price-value">${service.minPrice}</strong>
          </p>
          <button type="button" class="btn-select-service" data-service="${service.title}">
            Select Service
          </button>
        </footer>
      </article>
    `).join('');

    // --- CENTRAR AUTOMÁTICAMENTE LA ÚLTIMA TARJETA SI QUEDA SOLA ---
    const adjustOrphanCards = () => {
      const cards = servicesGrid.querySelectorAll('.service-card');
      if (cards.length === 0) return;

      // Limpiamos la clase por si acaso
      cards.forEach(card => card.classList.remove('is-centered-orphan'));

      // Comparamos la posición vertical (fila) de la última tarjeta con la anterior
      if (cards.length >= 2) {
        const lastCard = cards[cards.length - 1];
        const prevCard = cards[cards.length - 2];

        // Si están a distinta altura y hay más de 1 columna en pantalla, quedó sola en su fila
        const isMultiColumn = cards[0].offsetTop === cards[1].offsetTop;
        if (isMultiColumn && lastCard.offsetTop > prevCard.offsetTop) {
          lastCard.classList.add('is-centered-orphan');
        }
      }
    };

    // Lo ejecutamos al cargar y también si el usuario cambia el tamaño de la ventana
    adjustOrphanCards();
    window.addEventListener('resize', adjustOrphanCards);

    document.querySelectorAll('.btn-select-service').forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = btn.getAttribute('data-service');
        if (serviceSelect) {
          for (const option of serviceSelect.options) {
            if (option.value.toLowerCase().includes(chosen.split(' ')[0].toLowerCase())) {
              serviceSelect.value = option.value;
              break;
            }
          }
        }
        document.getElementById('estimate').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => document.getElementById('q-name').focus(), 500);
      });
    });
  }

  function renderTestimonials(testimonials) {
    if (!testimonialsGrid || !testimonials) return;
    testimonialsGrid.innerHTML = testimonials.map((item, index) => `
      <figure class="testimonial-card reveal" style="transition-delay: ${index * 0.12}s">
        <div>
          <p class="stars" aria-label="5 out of 5 stars">★★★★★</p>
          <blockquote>"${item.text}"</blockquote>
        </div>
        <figcaption class="testimonial-author">
          <strong>${item.author}</strong>
          <span>${item.role}</span>
        </figcaption>
      </figure>
    `).join('');
  }

  // 5. Visual feedback on submit (Web3Forms handles actual POST & redirect)
  if (quickForm) {
    quickForm.addEventListener('submit', () => {
      const submitBtn = quickForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Request...';
      }
    });
  }
});