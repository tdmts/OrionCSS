/*
 * hoorcollege.js -- de projectie van een deck. Zelfstartend, geen init.
 *
 * Toont een slide tegelijk en zet --schaal naar het venster. De slide zelf is
 * 254 bij 143mm en wordt alleen vergroot of verkleind (zie hoorcollege.css),
 * dus dit script rekent niets uit over de inhoud. Het meet er wel een ding
 * aan: past ze op de 143mm. Zo niet, dan draagt ze een rood "past niet" en
 * zegt de teller hoeveel er zo zijn.
 *
 *   pijl rechts, spatie, page down   volgende
 *   pijl links, page up              vorige
 *   home, end                        eerste, laatste
 *   f                                volledig scherm
 *   n                                de notities van de spreker
 *
 * Het nummer in de URL is dat van de slide in de reeks, niet dat van de
 * PowerPoint: data-slide houdt het oude nummer bij zodat IMPORT.md nog
 * aanwijst welke slide het was, maar wie #7 doorgeeft bedoelt de zevende.
 */

(function () {
    'use strict';

    var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
    if (!slides.length) { return; }

    var teller = document.createElement('div');
    teller.className = 'teller';
    document.body.appendChild(teller);

    var huidig = 0;
    var teVol = 0;
    var teKlein = 0;

    // Een slide is 143mm hoog en overflow: hidden, dus wat er niet op past
    // wordt weggeknipt en er gaat verder niets mis. In de handout staat die
    // slide op 45mm en dan valt het helemaal niet meer op. Daarom wordt elke
    // slide gemeten en draagt een te volle slide een rood label.
    //
    // Meten kan alleen op een zichtbare slide, want van display: none is
    // scrollHeight nul. De klasse gaat er dus even op en meteen weer af; dat
    // gebeurt in een keer, dus de browser tekent er niets van.
    //
    // Twee pixels speling: scrollHeight en clientHeight zijn afgeronde gehele
    // getallen en alles op een slide staat in millimeter.
    // Wat die meting NIET vindt is een figuur. hoorcollege.css geeft een
    // figuurafbeelding max-width: 100%, max-height: 100% en object-fit:
    // contain, dus ze krimpt tot ze past en scrollHeight groeit nooit. Een
    // figuur op --figuur-breedte: 400mm levert nul meldingen op; zo is dit
    // vastgesteld, en niet uit de css geredeneerd. Wat er dan gebeurt is stiller
    // dan afknippen en even erg: de tekening staat kleiner dan haar kader met
    // witruimte eromheen, en in de handout is dat nog eens 45 van de 143mm.
    // Daarom wordt een figuur apart gemeten, op de hoogte die ze werkelijk
    // getekend krijgt.
    //
    // ONDERGRENS_MM is aan de drie decks van DeN afgelezen en niet gekozen. Onder de
    // 20,4mm zit alles wat werkelijk stukgedrukt is; boven de 23,2mm begint de
    // kleinste figuur die er met opzet klein staat, een van de vier
    // toestelfoto's naast elkaar op slide 20 van Sessie2. De grens ligt in dat
    // gat, zodat de bestaande decks er geen valse meldingen uit krijgen.
    //
    // Een deck laadt de GEPUBLICEERDE hoorcollege.css. Wie een wijziging in de
    // checkout van OrionCSS wil meten, laadt een kopie van het deck waarin de
    // URL naar die checkout wijst. Een kopie zonder css rendert zonder maten
    // en zegt dan dat alles past: dat is al twee keer bijna misgegaan, en het
    // faalt zonder een woord.
    var ONDERGRENS_MM = 22;
    var SLIDE_MM = 254;

    // Het kader is niet de tekening: object-fit: contain past de tekening op
    // haar eigen verhouding in dat kader en laat de rest wit. Gemeten tegen de
    // breedte van de slide zelf, want --schaal rekt het geheel op tot het
    // venster en een meting in pixels zou dat meerekenen.
    // Nul kan twee dingen betekenen en het verschil is precies wat je wil weten.
    // Een figuur op display: none, zoals het witte masker van een titelslide,
    // wordt met opzet niet getoond en heeft geen offsetParent. Een figuur die
    // in een beelden-rij naast een brede tabel staat, wordt door flexbox tot
    // niets geknepen maar staat er wel: die heeft een offsetParent en nul
    // millimeter. Slide 45 van Sessie3 van DeN was zo'n geval, en zolang nul voor
    // "niet getoond" doorging, meldde deze controle er niets over.
    function getekendeHoogte(afbeelding, slideBreedPx) {
        if (afbeelding.offsetParent === null) { return -1; }
        if (!afbeelding.naturalHeight) { return -1; }
        var kader = afbeelding.getBoundingClientRect();
        var verhouding = afbeelding.naturalWidth / afbeelding.naturalHeight;
        return Math.min(kader.height, kader.width / verhouding) / slideBreedPx * SLIDE_MM;
    }

    function meet() {
        var vollen = 0;
        var kleintjes = 0;
        slides.forEach(function (slide) {
            var stond = slide.classList.contains('actief');
            slide.classList.add('actief');
            var vol = slide.scrollHeight - slide.clientHeight > 2;
            slide.classList.toggle('past-niet', vol);
            var breed = slide.getBoundingClientRect().width;
            var klein = breed > 0 && Array.prototype.some.call(
                slide.querySelectorAll('figure img'),
                function (afbeelding) {
                    var hoog = getekendeHoogte(afbeelding, breed);
                    // Min een is een figuur waar niets aan te meten valt; nul
                    // is een figuur die er staat en helemaal weggedrukt is.
                    return hoog >= 0 && hoog < ONDERGRENS_MM;
                });
            slide.classList.toggle('figuur-te-klein', klein);
            if (!stond) { slide.classList.remove('actief'); }
            if (vol) { vollen += 1; }
            if (klein) { kleintjes += 1; }
        });
        return { vol: vollen, klein: kleintjes };
    }

    function schaal() {
        var eersteSlide = slides[0];
        var breed = eersteSlide.offsetWidth;
        var hoog = eersteSlide.offsetHeight;
        if (!breed || !hoog) { return; }
        var factor = Math.min(window.innerWidth / breed, window.innerHeight / hoog);
        document.documentElement.style.setProperty('--schaal', factor);
    }

    function toon(index) {
        huidig = Math.max(0, Math.min(slides.length - 1, index));
        slides.forEach(function (slide, i) {
            slide.classList.toggle('actief', i === huidig);
        });
        teller.textContent = (huidig + 1) + ' / ' + slides.length;
        if (teVol) {
            // Een punt en geen spaties: HTML trekt twee spaties samen tot een.
            teller.textContent += teVol === 1
                ? ' · 1 slide past niet'
                : ' · ' + teVol + ' slides passen niet';
        }
        if (teKlein) {
            teller.textContent += teKlein === 1
                ? ' · 1 slide heeft een te kleine figuur'
                : ' · ' + teKlein + ' slides hebben een te kleine figuur';
        }
        if (window.location.hash !== '#' + (huidig + 1)) {
            history.replaceState(null, '', '#' + (huidig + 1));
        }
    }

    function uitHash() {
        var nummer = parseInt(window.location.hash.replace('#', ''), 10);
        return isNaN(nummer) ? 0 : nummer - 1;
    }

    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.altKey || e.metaKey) { return; }
        switch (e.key) {
        case 'ArrowRight': case ' ': case 'PageDown': toon(huidig + 1); break;
        case 'ArrowLeft': case 'PageUp': toon(huidig - 1); break;
        case 'Home': toon(0); break;
        case 'End': toon(slides.length - 1); break;
        case 'n':
            document.body.classList.toggle('notities-zichtbaar');
            break;
        case 'f':
            if (document.fullscreenElement) { document.exitFullscreen(); }
            else { document.documentElement.requestFullscreen(); }
            break;
        default: return;
        }
        e.preventDefault();
    });

    document.addEventListener('click', function (e) {
        if (e.target.closest('a')) { return; }
        toon(huidig + 1);
    });

    window.addEventListener('load', function () {
        var uitslag = meet();
        teVol = uitslag.vol;
        teKlein = uitslag.klein;
        toon(huidig);
        schaal();
    });

    window.addEventListener('resize', schaal);
    window.addEventListener('hashchange', function () { toon(uitHash()); });

    // Eerst tonen, dan meten: van een slide met display:none is offsetWidth 0.
    toon(uitHash());
    schaal();
}());
