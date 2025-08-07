// Contact page animations and form handling

document.addEventListener('DOMContentLoaded', function() {
  // Initialize GSAP animations
  gsap.registerPlugin(ScrollTrigger);
  
  // Setup floating elements animation
  const floatElements = gsap.utils.toArray('.floating-element');
  floatElements.forEach((el, i) => {
    gsap.to(el, {
      y: i % 2 === 0 ? 20 : -20,
      duration: 3 + i,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  });
  
  // Contact card animations
  const contactCard = document.querySelector('.contact-card');
  const formCard = document.querySelector('.form-card');
  
  gsap.to(contactCard, {
    scrollTrigger: {
      trigger: contactCard,
      start: "top 80%",
      toggleActions: "play none none none"
    },
    y: 0,
    opacity: 1,
    duration: 1,
    ease: "power3.out",
    onComplete: () => contactCard.classList.add('animate')
  });
  
  gsap.to(formCard, {
    scrollTrigger: {
      trigger: formCard,
      start: "top 80%",
      toggleActions: "play none none none"
    },
    y: 0,
    opacity: 1,
    duration: 1,
    delay: 0.3,
    ease: "power3.out",
    onComplete: () => formCard.classList.add('animate')
  });
  
  // Form input animations
  const inputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      gsap.to(this, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    input.addEventListener('blur', function() {
      gsap.to(this, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });
  
  // Form submission handling
  const contactForm = document.getElementById('contactForm');
  
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value || 'Not provided';
    const reason = document.getElementById('reason').options[document.getElementById('reason').selectedIndex].text;
    const message = document.getElementById('message').value;
    
    // Create WhatsApp message
    const whatsappMessage = `Hello! I'm contacting you from your website.
    
*Name:* ${name}
*Email:* ${email}
*Phone:* ${phone}
*Reason:* ${reason}

*Message:*
${message}`;
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    // WhatsApp number (replace with your actual number)
    const whatsappNumber = "919876543210"; // Example number
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Animation for button before redirecting
    const submitBtn = document.querySelector('.submit-btn');
    gsap.to(submitBtn, {
      scale: 0.95,
      backgroundColor: "#3a0ca3",
      duration: 0.3,
      onComplete: function() {
        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');
        
        // Reset button animation
        gsap.to(submitBtn, {
          scale: 1,
          backgroundColor: "#4361ee",
          duration: 0.3,
          delay: 0.5
        });
        
        // Reset form
        contactForm.reset();
      }
    });
  });
});
