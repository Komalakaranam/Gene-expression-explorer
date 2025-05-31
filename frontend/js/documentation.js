document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for documentation links
    document.querySelectorAll('.doc-nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Highlight current section in navigation
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('main section');
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 100) {
                currentSection = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.doc-nav a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });
});
