(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const form = $('#concept-form');
  const dialog = $('#experience');
  if (!form || !dialog) return;

  const fileInput = $('#room-photo');
  const dropzone = $('#dropzone');
  const preview = $('#upload-preview');
  const previewImage = $('#photo-preview');
  const previewFrame = $('.photo-preview-frame') || preview;
  const error = $('#form-error');
  let photo = null;
  let objectUrl = null;
  let uploadVersion = 0;
  let timers = [];
  let selectedStyle = $('.style-choice.selected')?.dataset.style || 'Warm & timeless';
  let monthOffset = 0;
  let selectedDate = null;
  let selectedTime = null;

  const iconArrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5"/></svg>';
  dialog.classList.add('flow-dialog');
  dialog.setAttribute('aria-labelledby', 'flow-title');
  dialog.innerHTML = `
    <div class="flow-shell">
      <button class="flow-close" type="button" aria-label="Close preview"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button>
      <section class="flow-view flow-loading" data-view="loading" hidden>
        <span class="flow-spark" aria-hidden="true">✧</span>
        <p class="eyebrow">A LITTLE INSPIRATION IS ON ITS WAY</p>
        <h2 id="flow-title" tabindex="-1">Let’s imagine the possibilities.</h2>
        <p class="flow-loading-copy">Opening your illustrative design preview.</p>
        <div class="flow-progress" role="progressbar" aria-label="Preparing sample concept" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>
        <p class="flow-progress-label" aria-live="polite">Finding a fresh perspective…</p>
        <p class="flow-disclosure">Interactive mockup · Your photo stays in this browser.</p>
      </section>

      <section class="flow-view" data-view="result" hidden>
        <div class="flow-result-heading"><p class="eyebrow">YOUR ROOM, REIMAGINED</p><h2 class="flow-view-title" tabindex="-1">See what’s possible.</h2><p>A little inspiration. The beginning of something beautiful.</p></div>
        <div class="flow-result-grid">
          <div class="flow-result-image">
            <div class="flow-comparison" style="--reveal:50%">
              <div class="flow-after"></div><div class="flow-before"></div>
              <span class="flow-image-label flow-label-before">Before</span><span class="flow-image-label flow-label-after">The possibility</span>
              <div class="flow-divider" aria-hidden="true"><span>‹<i></i>›</span></div>
              <input class="flow-range" type="range" min="0" max="100" value="50" aria-label="Compare the original sample room and illustrative concept">
            </div>
            <p class="flow-comparison-hint"><span aria-hidden="true">↔</span> Drag to explore the transformation</p>
            <p class="flow-disclosure flow-result-disclosure">Illustrative concept — this preview uses a sample image, not a render of your upload.</p>
          </div>
          <div class="flow-invitation">
            <span class="flow-style-tag"></span>
            <h3>Now, let’s make<br>it feel like home.</h3>
            <p>Great design goes beyond a beautiful picture. Jackie will help you discover what works for your space, your lifestyle, and the way you want to live.</p>
            <div class="flow-jackie"><img src="assets/jackie.jpg" alt="Jackie Glass"><div><strong>Jackie Glass</strong><span>Principal Designer</span></div></div>
            <button type="button" class="btn flow-book-button">Bring this to life ${iconArrow}</button>
            <p class="flow-consultation-meta">In-home consultation · 2 hours · $950</p>
            <button type="button" class="flow-text-button flow-edit-button">Try another photo or style</button>
          </div>
        </div>
      </section>

      <section class="flow-view flow-booking" data-view="booking" hidden>
        <button class="flow-back" type="button" aria-label="Back to concept">← <span>Your concept</span></button>
        <div class="flow-booking-heading"><p class="eyebrow">FROM INSPIRATION TO REAL LIFE</p><h2 class="flow-view-title" tabindex="-1">Let’s talk about your home.</h2><p>Choose a time for an in-person design consultation with Jackie.</p></div>
        <form id="flow-booking-form" novalidate>
          <div class="flow-booking-grid">
            <div class="flow-schedule">
              <div class="flow-consultation-card"><img src="assets/jackie.jpg" alt=""><div><strong>At home with Jackie</strong><p>2 hours <span>·</span> $950 <span>·</span> In your home</p></div></div>
              <div class="flow-calendar-head"><h3 id="flow-month" aria-live="polite"></h3><div><button type="button" class="flow-month-prev" aria-label="Previous month">‹</button><button type="button" class="flow-month-next" aria-label="Next month">›</button></div></div>
              <div class="flow-calendar-weekdays" aria-hidden="true"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>
              <div class="flow-calendar" role="group" aria-labelledby="flow-month"></div>
              <div class="flow-availability"><span></span> Sample availability <small>Eastern Time · Toronto</small></div>
              <div class="flow-times"><h4 id="flow-time-label">Select a date to see times</h4><div class="flow-time-options" role="group" aria-labelledby="flow-time-label"></div></div>
            </div>
            <div class="flow-booking-details">
              <p class="flow-step-label">A FEW DETAILS BEFORE WE MEET</p>
              <div class="flow-field"><label for="flow-name">Your name</label><input id="flow-name" name="name" autocomplete="name" required placeholder="First and last name"></div>
              <div class="flow-field"><label for="flow-email">Email address</label><input id="flow-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"></div>
              <div class="flow-field"><label for="flow-street">Street address</label><input id="flow-street" name="street" autocomplete="street-address" required placeholder="Where your project begins"></div>
              <div class="flow-field"><label for="flow-city">City</label><input id="flow-city" name="city" autocomplete="address-level2" required placeholder="Your city"></div>
              <div class="flow-selection-summary" aria-live="polite"><span>Your consultation</span><strong>Choose a date and time</strong></div>
              <p id="flow-booking-error" class="flow-error" role="alert"></p>
              <button type="submit" class="btn flow-request-button">Preview consultation request ${iconArrow}</button>
              <p class="flow-disclosure">Demo only. No appointment is booked, no payment is collected, and no information is sent.</p>
            </div>
          </div>
        </form>
      </section>

      <section class="flow-view flow-confirmation" data-view="confirmation" hidden>
        <span class="flow-confirm-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="m8 16 5 5 11-11" stroke="currentColor" stroke-width="1.4" fill="none"/></svg></span>
        <p class="eyebrow">A FIRST STEP TOWARD SOMETHING BEAUTIFUL</p>
        <h2 class="flow-view-title" tabindex="-1">Your home’s next chapter.</h2>
        <p class="flow-confirm-intro"></p>
        <div class="flow-confirm-summary"><span>IN-HOME DESIGN CONSULTATION</span><strong class="flow-confirm-date"></strong><p class="flow-confirm-place"></p><p>2 hours · $950 · With Jackie Glass</p></div>
        <div class="flow-demo-note"><strong>This is a preview, not a booking.</strong><p>No appointment has been reserved and no details have been sent. The live site would connect this step to Jackie’s calendar.</p></div>
        <button type="button" class="btn flow-done-button">Back to the inspiration ${iconArrow}</button>
      </section>
    </div>`;

  const bookingForm = $('#flow-booking-form');
  const bookingError = $('#flow-booking-error');
  const progress = $('.flow-progress');
  const progressFill = $('.flow-progress span');
  const progressLabel = $('.flow-progress-label');

  function clearTimers() {
    timers.forEach(window.clearTimeout);
    timers = [];
  }

  function showView(name) {
    $$('.flow-view', dialog).forEach(view => { view.hidden = view.dataset.view !== name; });
    dialog.dataset.view = name;
    const view = $(`[data-view="${name}"]`, dialog);
    const heading = $('h2', view);
    dialog.setAttribute('aria-labelledby', name === 'loading' ? 'flow-title' : `flow-${name}-title`);
    if (name !== 'loading') heading.id = `flow-${name}-title`;
    if (!dialog.open) {
      dialog.showModal();
      document.documentElement.classList.add('flow-modal-open');
    }
    dialog.scrollTop = 0;
    requestAnimationFrame(() => heading.focus({ preventScroll: true }));
  }

  function closeDialog() {
    clearTimers();
    dialog.close();
  }

  $('.flow-close').addEventListener('click', closeDialog);
  dialog.addEventListener('close', () => {
    clearTimers();
    document.documentElement.classList.remove('flow-modal-open');
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog();
    }
  });

  function resetObjectUrl() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }

  function showPhoto(name, sample = false) {
    $('#upload-empty').hidden = true;
    preview.hidden = false;
    previewFrame.classList.toggle('flow-sample-frame', sample);
    previewImage.hidden = sample;
    if (sample) previewImage.removeAttribute('src');
    $('#photo-name').textContent = name;
    dropzone.classList.add('has-photo');
    error.textContent = '';
  }

  async function loadPhoto(file) {
    const version = ++uploadVersion;
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      error.textContent = 'Please choose a JPG, PNG, or WebP image.';
      fileInput.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      error.textContent = 'That photo is a little too large. Please choose an image under 10 MB.';
      fileInput.value = '';
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    const probe = new Image();
    try {
      probe.src = nextUrl;
      await probe.decode();
      if (!probe.naturalWidth || !probe.naturalHeight) throw new Error('Empty image');
      if (version !== uploadVersion) {
        URL.revokeObjectURL(nextUrl);
        return;
      }
      resetObjectUrl();
      objectUrl = nextUrl;
      photo = { kind: 'upload', name: file.name };
      previewImage.src = objectUrl;
      previewImage.alt = 'Your uploaded room photo';
      showPhoto(file.name);
    } catch {
      URL.revokeObjectURL(nextUrl);
      if (version === uploadVersion) {
        error.textContent = 'We couldn’t open that image. Please try another JPG, PNG, or WebP photo.';
        fileInput.value = '';
      }
    }
  }

  fileInput.addEventListener('change', () => loadPhoto(fileInput.files[0]));
  ['dragenter', 'dragover'].forEach(name => dropzone.addEventListener(name, event => {
    event.preventDefault();
    dropzone.classList.add('flow-drag-over');
  }));
  dropzone.addEventListener('dragleave', event => {
    if (!dropzone.contains(event.relatedTarget)) dropzone.classList.remove('flow-drag-over');
  });
  dropzone.addEventListener('drop', event => {
    event.preventDefault();
    dropzone.classList.remove('flow-drag-over');
    if (event.dataTransfer.files.length > 1) {
      error.textContent = 'One room at a time. Please upload a single photo.';
      return;
    }
    loadPhoto(event.dataTransfer.files[0]);
  });

  $('#remove-photo').addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    uploadVersion++;
    resetObjectUrl();
    photo = null;
    fileInput.value = '';
    previewImage.removeAttribute('src');
    previewImage.hidden = false;
    previewFrame.classList.remove('flow-sample-frame');
    preview.hidden = true;
    $('#upload-empty').hidden = false;
    dropzone.classList.remove('has-photo');
    error.textContent = '';
    $('#use-sample').focus();
  });

  $('#use-sample').addEventListener('click', () => {
    uploadVersion++;
    resetObjectUrl();
    fileInput.value = '';
    photo = { kind: 'sample', name: 'Example living room' };
    showPhoto(photo.name, true);
    form.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
  });

  $$('.style-choice').forEach(button => button.addEventListener('click', () => {
    selectedStyle = button.dataset.style;
    $$('.style-choice').forEach(choice => {
      const selected = choice === button;
      choice.classList.toggle('selected', selected);
      choice.setAttribute('aria-pressed', String(selected));
    });
  }));

  function connectSlider(input, comparison) {
    if (!input || !comparison) return;
    const update = () => {
      comparison.style.setProperty('--reveal', `${input.value}%`);
      input.setAttribute('aria-valuetext', `${input.value}% original image visible`);
    };
    input.addEventListener('input', update);
    update();
  }
  connectSlider($('#hero-slider'), $('#hero-comparison'));
  connectSlider($('.flow-range'), $('.flow-comparison'));

  form.addEventListener('submit', event => {
    event.preventDefault();
    error.textContent = '';
    if (!photo) {
      error.textContent = 'Add a photo of your room, or try the example photo to explore the concept.';
      $('#use-sample').focus();
      return;
    }
    if (!$('#first-name').value.trim()) {
      error.textContent = 'Please enter your first name.';
      $('#first-name').focus();
      return;
    }
    if (!form.reportValidity()) return;
    $('.flow-style-tag').textContent = selectedStyle;
    clearTimers();
    showView('loading');
    progress.setAttribute('aria-valuenow', '12');
    progressFill.style.width = '12%';
    progressLabel.textContent = 'Finding a fresh perspective…';
    timers.push(setTimeout(() => {
      progress.setAttribute('aria-valuenow', '52');
      progressFill.style.width = '52%';
      progressLabel.textContent = 'Bringing the details together…';
    }, 500));
    timers.push(setTimeout(() => {
      progress.setAttribute('aria-valuenow', '100');
      progressFill.style.width = '100%';
      progressLabel.textContent = 'Your example concept is ready.';
    }, 1300));
    timers.push(setTimeout(() => showView('result'), 1800));
  });

  $('.flow-edit-button').addEventListener('click', () => {
    closeDialog();
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  const dateParts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto', year: 'numeric', month: 'numeric', day: 'numeric'
  }).formatToParts(new Date()).filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
  const today = new Date(Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day));
  const finalDate = new Date(Date.UTC(dateParts.year, dateParts.month + 2, dateParts.day));
  const dateKey = date => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  const fullDate = date => new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' }).format(date);
  const shortDate = date => new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', month: 'short', day: 'numeric' }).format(date);

  function renderCalendar() {
    const monthDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + monthOffset, 1));
    $('#flow-month').textContent = new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(monthDate);
    $('.flow-month-prev').disabled = monthOffset === 0;
    $('.flow-month-next').disabled = monthOffset === 3;
    const calendar = $('.flow-calendar');
    calendar.replaceChildren();
    for (let i = 0; i < monthDate.getUTCDay(); i++) {
      const space = document.createElement('span');
      space.className = 'flow-calendar-space';
      calendar.append(space);
    }
    const days = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0)).getUTCDate();
    for (let day = 1; day <= days; day++) {
      const date = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), day));
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'flow-calendar-day';
      button.textContent = String(day);
      button.setAttribute('aria-label', fullDate(date));
      button.disabled = date <= today || date > finalDate || date.getUTCDay() === 0 || date.getUTCDay() === 6;
      const selected = selectedDate && dateKey(date) === dateKey(selectedDate);
      button.classList.toggle('is-selected', Boolean(selected));
      button.setAttribute('aria-pressed', String(Boolean(selected)));
      if (dateKey(date) === dateKey(today)) button.setAttribute('aria-current', 'date');
      button.addEventListener('click', () => {
        selectedDate = date;
        selectedTime = null;
        bookingError.textContent = '';
        renderCalendar();
        renderTimes();
        updateSelection();
        $(`.flow-calendar-day.is-selected`).focus();
      });
      calendar.append(button);
    }
  }

  function renderTimes() {
    $('#flow-time-label').textContent = selectedDate ? fullDate(selectedDate) : 'Select a date to see times';
    const times = $('.flow-time-options');
    times.replaceChildren();
    if (!selectedDate) return;
    ['10:00 AM', '1:00 PM', '3:00 PM'].forEach(time => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'flow-time';
      button.textContent = time;
      button.classList.toggle('is-selected', selectedTime === time);
      button.setAttribute('aria-pressed', String(selectedTime === time));
      button.addEventListener('click', () => {
        selectedTime = time;
        bookingError.textContent = '';
        $$('.flow-time').forEach(slot => {
          const selected = slot === button;
          slot.classList.toggle('is-selected', selected);
          slot.setAttribute('aria-pressed', String(selected));
        });
        updateSelection();
      });
      times.append(button);
    });
  }

  function updateSelection() {
    $('.flow-selection-summary strong').textContent = selectedDate && selectedTime
      ? `${shortDate(selectedDate)} at ${selectedTime} ET · 2 hours`
      : selectedDate ? `${shortDate(selectedDate)} · Choose a time` : 'Choose a date and time';
  }

  $('.flow-month-prev').addEventListener('click', () => {
    monthOffset = Math.max(0, monthOffset - 1);
    renderCalendar();
  });
  $('.flow-month-next').addEventListener('click', () => {
    monthOffset = Math.min(3, monthOffset + 1);
    renderCalendar();
  });
  $('.flow-book-button').addEventListener('click', () => {
    $('#flow-name').value = $('#first-name').value.trim();
    $('#flow-email').value = $('#email').value.trim();
    renderCalendar();
    renderTimes();
    updateSelection();
    showView('booking');
  });
  $('.flow-back').addEventListener('click', () => showView('result'));
  bookingForm.addEventListener('submit', event => {
    event.preventDefault();
    bookingError.textContent = '';
    if (!selectedDate || !selectedTime) {
      bookingError.textContent = 'Please choose a consultation date and time.';
      (selectedDate ? $('.flow-time') : $('.flow-calendar-day:not(:disabled)'))?.focus();
      return;
    }
    const blank = $$('input[required]', bookingForm).find(input => !input.value.trim());
    if (blank) {
      bookingError.textContent = 'Please complete your contact details and home address.';
      blank.focus();
      return;
    }
    if (!bookingForm.reportValidity()) return;
    $('.flow-confirm-intro').textContent = `${$('#flow-name').value.trim()}, here’s how your consultation request would look.`;
    $('.flow-confirm-date').textContent = `${fullDate(selectedDate)} at ${selectedTime} ET`;
    $('.flow-confirm-place').textContent = `${$('#flow-street').value.trim()}, ${$('#flow-city').value.trim()}`;
    showView('confirmation');
  });
  $('.flow-done-button').addEventListener('click', () => showView('result'));
  window.addEventListener('beforeunload', resetObjectUrl);
  $('#generate-button').disabled = false;
})();

