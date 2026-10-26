# Jackie Glass — Your room, reimagined

A static, interactive landing-page mockup: room photo → illustrative design concept → consultation calendar preview.

## What the preview does

- Shows a sample before-and-after concept; it does not generate AI images from uploads.
- Displays sample calendar availability; it does not book appointments, send emails, or collect payment.
- Keeps uploaded photos and entered form details in the current browser page. The form does not send data to a server or save it to browser storage.
- Loads fonts from Google Fonts. All other presentation assets are included in this repository.

## Publish with GitHub Pages

Use a public GitHub repository for free GitHub Pages hosting. In **Settings → Pages**, select **Deploy from a branch**, choose **main** and **/ (root)**, then save. No build step, package install, custom domain, or paid integration is required for this mockup.

The relative asset paths work on both a project URL (`https://USERNAME.github.io/REPOSITORY/`) and a user site (`https://USERNAME.github.io/`). The empty `.nojekyll` file serves the static files without Jekyll processing.

## Files

- `index.html` — landing page and form
- `style.css`, `flow.css` — responsive presentation
- `app.js` — local interactions and simulated concept/booking flow
- `assets/` — logo, Jackie portrait, and illustrative room comparison

To try the flow, select **Try a sample room**, enter example contact details, and select **Create my free concept**.

A live lead-generation service would require separate AI, form, and calendar integrations; none are connected in this preview.

