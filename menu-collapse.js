// Menu collapse functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('banner-hamburger');
    const menuItems = document.getElementById('banner-menu-items');
    
    if (hamburger && menuItems) {
        hamburger.addEventListener('click', function() {
            menuItems.classList.toggle('active');
            
            // Change hamburger icon
            const icon = hamburger.querySelector('i');
            if (menuItems.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking on a link
        const menuLinks = menuItems.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuItems.classList.remove('active');
                const icon = hamburger.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
});