document.addEventListener("DOMContentLoaded", function() {
    
    // --- Automatisatie: Figure Zoom ---
    // Zoek alle figures met class 'figure-zoom'
    const zoomFigures = document.querySelectorAll('figure.figure-zoom');
    
    zoomFigures.forEach(figure => {
        const img = figure.querySelector('img');
        if (!img) return;

        // 1. Wrap image in anchor (<a>) als dat nog niet gebeurd is
        if (img.parentElement.tagName !== 'A') {
            const link = document.createElement('a');
            link.href = img.src;
            link.target = '_blank';
            link.rel = 'noopener';
            link.className = 'zoom-link';
            link.title = 'Klik om te vergroten';
            
            // Plaats de link voor de afbeelding
            img.parentNode.insertBefore(link, img);
            // Verplaats de afbeelding in de link
            link.appendChild(img);
        }

        // 2. Voeg figcaption toe als die niet bestaat
        let caption = figure.querySelector('figcaption');
        if (!caption) {
            caption = document.createElement('figcaption');
            figure.appendChild(caption);
        }
        // Zorg dat de juiste class aanwezig is voor de CSS styling
        caption.classList.add('figure-caption');
    });

    // --- Functionaliteit: Copy Code Buttons ---
    // 1. Injecteer buttons in alle code-wrappers
    document.querySelectorAll('.code-wrapper').forEach(wrapper => {
        if (!wrapper.querySelector('.btn-copy')) {
            const button = document.createElement('button');
            button.className = 'btn-copy';
            button.title = 'Kopieer naar klembord';
            button.setAttribute('aria-label', 'Kopieer naar klembord');
            wrapper.appendChild(button);
        }
    });

    // 2. Voeg click event listeners toe
    document.querySelectorAll('.btn-copy').forEach(button => {
        button.addEventListener('click', () => {
            const wrapper = button.closest('.code-wrapper');
            const codeBlock = wrapper.querySelector('code');
            if (!codeBlock) return;
            
            const text = codeBlock.innerText;

            navigator.clipboard.writeText(text).then(() => {
                button.classList.add('copied');
                setTimeout(() => {
                    button.classList.remove('copied');
                }, 2000);
            });
        });
    });

    // --- Functionaliteit: Stappenplan (Wizard) ---
    document.querySelectorAll('.steps-container').forEach(container => {
        // 1. Titel en caption ophalen (via attribuut of child element met class .title/.caption)
        let containerTitle = container.dataset.title;
        let containerCaption = container.dataset.caption;

        const titleEl = container.querySelector(':scope > .title');
        if (titleEl) {
            containerTitle = titleEl.innerText;
            titleEl.remove();
        }

        const captionEl = container.querySelector(':scope > .caption');
        if (captionEl) {
            containerCaption = captionEl.innerText;
            captionEl.remove();
        }

        if (containerTitle) {
            const title = document.createElement('h3');
            title.innerText = containerTitle;
            title.style.marginBottom = '5px'; // Minder marge zodat onderschrift aansluit
            
            const subtitle = document.createElement('p');
            subtitle.className = 'text-muted fst-italic small';
            subtitle.innerText = containerCaption || 'Gebruik de pijltjes om de stappen te overlopen';
            subtitle.style.marginBottom = '20px';
            
            container.prepend(subtitle);
            container.prepend(title);
        }

        // Haal alle directe kinderen op die een stap zijn
        const steps = Array.from(container.children).filter(el => el.classList.contains('step-item'));
        
        steps.forEach((step, index) => {
            // 1. Maak de navigatie header
            const nav = document.createElement('div');
            nav.className = 'step-navigation';

            // Vorige knop
            const btnBack = document.createElement('button');
            btnBack.className = 'btn-step-nav btn-step-back';
            btnBack.ariaLabel = "Vorige stap";
            if (index === 0) btnBack.disabled = true;
            else btnBack.onclick = () => setActiveStep(steps, index - 1);

            // Titel
            let stepTitle = step.dataset.title;
            const stepTitleEl = step.querySelector(':scope > .step');
            if (stepTitleEl) {
                stepTitle = stepTitleEl.innerText;
                stepTitleEl.remove();
            }

            const title = document.createElement('h3');
            title.innerText = stepTitle || `STAP ${index + 1}`;

            // Volgende knop
            const btnNext = document.createElement('button');
            btnNext.className = 'btn-step-nav btn-step-next';
            btnNext.ariaLabel = "Volgende stap";
            if (index === steps.length - 1) btnNext.disabled = true;
            else btnNext.onclick = () => setActiveStep(steps, index + 1);

            // Voeg alles samen
            nav.appendChild(btnBack);
            nav.appendChild(title);
            nav.appendChild(btnNext);
            
            // Plaats de navigatie bovenaan in de stap
            step.prepend(nav);
        });

        // Activeer de eerste stap bij het laden
        if (steps.length > 0) setActiveStep(steps, 0);
    });

    function setActiveStep(steps, index) {
        steps.forEach((step, i) => {
            if (i === index) step.classList.add('active');
            else step.classList.remove('active');
        });
    }

    // --- Functionaliteit: Accordion ---
    document.querySelectorAll('.accordion-container').forEach((container, index) => {
        // Voeg de Bootstrap class toe
        container.classList.add('accordion');
        
        // Genereer een uniek ID voor de parent als die er nog niet is
        const accordionId = container.id || `accordionGen${index}`;
        container.id = accordionId;

        container.querySelectorAll('.accordion-item').forEach((item, itemIndex) => {
            // 1. Titel ophalen
            let titleText = 'Item';
            const titleEl = item.querySelector(':scope > .title');
            if (titleEl) {
                titleText = titleEl.innerHTML;
                titleEl.remove();
            }

            // 2. Content bewaren (alles wat overblijft in de item div)
            const content = item.innerHTML;
            item.innerHTML = ''; // Item leegmaken om opnieuw op te bouwen

            // 3. Unieke IDs genereren voor de koppeling button <-> collapse
            const headingId = `${accordionId}-heading${itemIndex}`;
            const collapseId = `${accordionId}-collapse${itemIndex}`;

            // 4. Bootstrap structuur opbouwen
            // Header (H2) met Button
            const header = document.createElement('h2');
            header.className = 'accordion-header';
            header.id = headingId;

            const btn = document.createElement('button');
            btn.className = 'accordion-button collapsed';
            btn.type = 'button';
            btn.setAttribute('data-bs-toggle', 'collapse');
            btn.setAttribute('data-bs-target', `#${collapseId}`);
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-controls', collapseId);
            btn.innerHTML = titleText;

            header.appendChild(btn);

            // Collapse container met Body
            const collapse = document.createElement('div');
            collapse.id = collapseId;
            collapse.className = 'accordion-collapse collapse';
            collapse.setAttribute('aria-labelledby', headingId);
            collapse.setAttribute('data-bs-parent', `#${accordionId}`);
            collapse.innerHTML = `<div class="accordion-body">${content}</div>`;

            item.appendChild(header);
            item.appendChild(collapse);
        });
    });

    // --- Functionaliteit: Spoiler Container ---
    document.querySelectorAll('.spoiler-container').forEach(container => {
        // 1. Elementen ophalen
        const basicEl = container.querySelector(':scope > .basic');
        const buttonEl = container.querySelector(':scope > .button');
        const hiddenEl = container.querySelector(':scope > .hidden');

        // 2. Data ophalen
        const basicHTML = basicEl ? basicEl.innerHTML : '';
        let buttonText = 'Meer tonen'; // Default tekst
        if (buttonEl) {
            buttonText = buttonEl.innerText;
        } else if (container.dataset.title) {
            buttonText = container.dataset.title;
        }

        // Content ophalen (expliciet of fallback voor backward compatibility)
        let hiddenHTML = '';
        if (hiddenEl) {
            hiddenHTML = hiddenEl.innerHTML;
        } else {
            // Fallback: kloon container, verwijder bekende elementen, rest is content
            const clone = container.cloneNode(true);
            clone.querySelectorAll(':scope > .basic, :scope > .button, :scope > .intro, :scope > .title').forEach(el => el.remove());
            hiddenHTML = clone.innerHTML.trim();
        }

        // 3. Container leegmaken en herbouwen
        container.innerHTML = '';

        // Button
        const btn = document.createElement('button');
        btn.className = 'btn-spoiler';
        btn.innerText = buttonText;

        // Basic text (Introductie)
        if (basicHTML) {
            const basicDiv = document.createElement('div');
            basicDiv.style.marginBottom = '10px';
            basicDiv.innerHTML = basicHTML;
            
            // Probeer de knop in de laatste paragraaf te steken als die bestaat, anders gewoon achteraan de div
            const lastChild = basicDiv.lastElementChild;
            if (lastChild && (lastChild.tagName === 'P' || lastChild.tagName === 'DIV')) {
                lastChild.appendChild(btn);
            } else {
                basicDiv.appendChild(btn);
            }
            container.appendChild(basicDiv);
        } else {
            container.appendChild(btn);
        }
        
        // Content wrapper
        const contentDiv = document.createElement('div');
        contentDiv.className = 'spoiler-content';
        contentDiv.innerHTML = hiddenHTML;

        container.appendChild(contentDiv);

        // 4. Click event
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            contentDiv.classList.toggle('active');
        });
    });

    // --- Functionaliteit: Download Container ---
    document.querySelectorAll('.download-container').forEach(container => {
        const link = container.querySelector('a');
        const list = container.querySelector('ul');

        if (!link) return;

        // Data ophalen
        const linkHref = link.getAttribute('href');
        const linkText = link.innerText.trim();
        const listContent = list ? list.innerHTML : '';

        // Container leegmaken en herbouwen
        container.innerHTML = '';

        const row = document.createElement('div');
        row.className = 'row align-items-center gy-3';

        // 1. Knop kolom
        const colBtn = document.createElement('div');
        colBtn.className = 'col-md-auto';
        const btn = document.createElement('a');
        btn.href = linkHref;
        btn.className = 'btn btn-download shadow-sm';
        btn.innerText = linkText;
        colBtn.appendChild(btn);
        row.appendChild(colBtn);

        // 2. Instructies kolom (alleen als er een lijst is)
        if (listContent) {
            const colDiv = document.createElement('div');
            colDiv.className = 'col-md-auto d-none d-md-block';
            colDiv.innerHTML = '<div class="vr" style="height: 50px; opacity: 0.2;"></div>';
            row.appendChild(colDiv);

            const colList = document.createElement('div');
            colList.className = 'col-md';
            const ul = document.createElement('ul');
            ul.className = 'download-instructions';
            ul.innerHTML = listContent;
            colList.appendChild(ul);
            row.appendChild(colList);
        }
        
        container.appendChild(row);
    });
});